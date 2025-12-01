import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, tap, catchError, throwError, map, of } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import type { FoodEntry } from '../models/food.model'
import { FoodApiService } from './food-api.service' // Import new API service
import { API_CONFIG } from '../config/api-config' // Import API_CONFIG

@Injectable({ providedIn: 'root' })
export class FoodService {
  private entriesSubject = new BehaviorSubject<FoodEntry[]>([])
  public entries$ = this.entriesSubject.asObservable()

  constructor(private foodApi: FoodApiService) { // Inject FoodApiService
    this.loadFromStorage()
  }

  getEntries(): FoodEntry[] {
    return this.entriesSubject.value
  }

  addEntry(payload: Omit<FoodEntry, 'id' | 'createdAt'>): Observable<FoodEntry> {
    return this.foodApi.create(payload).pipe( // payload can be directly used as FoodEntry type
        // On success, update local subject and cache
        tap((entry) => {
          const current = [entry, ...this.entriesSubject.value]
          this.entriesSubject.next(current)
          this.saveToStorage(current)
        }),
        catchError((e) => {
          console.error('Failed to add food entry in backend.', e)
          return throwError(() => e) // Re-throw the error after logging
        })
    )
  }

  updateEntry(id: string, changes: Partial<FoodEntry>): Observable<FoodEntry> {
    const currentEntry = this.entriesSubject.value.find(e => e.id === id)
    if (!currentEntry) return throwError(() => new Error('Food entry not found'))

    const updatedEntry: FoodEntry = { ...currentEntry, ...changes }

      return this.foodApi.update(id, changes).pipe(
        map((entry) => {
        const updated = this.entriesSubject.value.map((e) => (e.id === id ? entry : e))
        this.entriesSubject.next(updated)
        this.saveToStorage(updated)
        return entry
      }),
      catchError((e) => {
        console.error('Failed to update food entry in backend.', e)
        return throwError(() => e)
      })
    )
  }

  deleteEntry(id: string): Observable<void> {
    return this.foodApi.delete(id).pipe(
      tap(() => {
        const filtered = this.entriesSubject.value.filter((e) => e.id !== id)
        this.entriesSubject.next(filtered)
        this.saveToStorage(filtered)
      }),
      catchError((e) => {
        console.error('Failed to delete food entry in backend.', e)
        return throwError(() => e) // Re-throw the error after logging
      })
    )
  }

  clearAll(): void {
    this.entriesSubject.next([])
    localStorage.removeItem('foodEntries')
  }

  private saveToStorage(items: FoodEntry[]) {
    try {
      localStorage.setItem('foodEntries', JSON.stringify(items))
    } catch (e) {
      console.error('Error saving food entries:', e)
    }
  }

  private loadFromStorage() {
    this.foodApi.getAll().subscribe({
      next: (entries) => {
        this.entriesSubject.next(entries)
        this.saveToStorage(entries) // Save fetched backend entries to local storage
      },
      error: (e: HttpErrorResponse) => {
        console.warn('Failed to load food entries from backend, initializing with empty array.', e)
        this.entriesSubject.next([]) // Initialize with empty array if backend fails
      }
    })
  }

  private loadLocalFoodEntries() {
    try {
      const raw = localStorage.getItem('foodEntries')
      if (raw) {
        const parsed = JSON.parse(raw) as FoodEntry[]
        this.entriesSubject.next(parsed)
      } else {
        this.entriesSubject.next([]) // Initialize with empty array, no local seed.
      }
    } catch (e) {
      console.error('Error loading food entries:', e)
      this.entriesSubject.next([])
    }
  }


}
