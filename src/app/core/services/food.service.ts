import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import type { FoodEntry } from '../models/food.model'

@Injectable({ providedIn: 'root' })
export class FoodService {
  private entriesSubject = new BehaviorSubject<FoodEntry[]>([])
  public entries$ = this.entriesSubject.asObservable()

  constructor() {
    this.loadFromStorage()
  }

  getEntries(): FoodEntry[] {
    return this.entriesSubject.value
  }

  addEntry(payload: Omit<FoodEntry, 'id' | 'createdAt'>): FoodEntry {
    const e: FoodEntry = {
      id: this.generateId(),
      ...payload,
      createdAt: new Date().toISOString(),
    }
    const current = [e, ...this.entriesSubject.value]
    this.entriesSubject.next(current)
    this.saveToStorage(current)
    return e
  }

  updateEntry(id: string, changes: Partial<FoodEntry>): void {
    const updated = this.entriesSubject.value.map((e) => (e.id === id ? { ...e, ...changes } : e))
    this.entriesSubject.next(updated)
    this.saveToStorage(updated)
  }

  deleteEntry(id: string): void {
    const filtered = this.entriesSubject.value.filter((e) => e.id !== id)
    this.entriesSubject.next(filtered)
    this.saveToStorage(filtered)
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
    try {
      const raw = localStorage.getItem('foodEntries')
      if (raw) {
        const parsed = JSON.parse(raw) as FoodEntry[]
        this.entriesSubject.next(parsed)
      } else {
        // seed example with user ids and date
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const dateStr = `${yyyy}-${mm}-${dd}`
        const seed: FoodEntry[] = [
          { id: this.generateId(), meal: 'breakfast', description: 'Avena con frutas', date: dateStr, time: '08:00', createdAt: new Date().toISOString(), addedBy: 'Cuidador', addedById: '2', targetId: '1' },
          { id: this.generateId(), meal: 'lunch', description: 'Arroz con pollo', date: dateStr, time: '13:00', createdAt: new Date().toISOString(), addedBy: 'Cuidador', addedById: '2', targetId: '1' },
          { id: this.generateId(), meal: 'dinner', description: 'Sopa de verduras', date: dateStr, time: '19:00', createdAt: new Date().toISOString(), addedBy: 'Cuidador', addedById: '2', targetId: '1' },
        ]
        this.entriesSubject.next(seed)
        this.saveToStorage(seed)
      }
    } catch (e) {
      console.error('Error loading food entries:', e)
      this.entriesSubject.next([])
    }
  }

  private generateId(): string {
    return 'food_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
  }
}
