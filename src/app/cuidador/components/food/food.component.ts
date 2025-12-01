import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LayoutComponent } from '../layout/layout.component'
import { FoodService } from '../../../core/services/food.service'
import { AuthService } from '../../../core/services/auth.service'
import { UsersApiService } from '../../../core/services/users-api.service'
import { API_CONFIG } from '../../../core/config/api-config'
import type { FoodEntry, MealType } from '../../../core/models/food.model'
import type { User } from '../../../core/models/user.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-cuidador-food',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css'],
})
export class FoodComponent implements OnInit, OnDestroy {
  entries: FoodEntry[] = []
  familiares: User[] = []
  meal: MealType = 'breakfast'
  description = ''
  date = ''
  time = ''
  editingId: string | null = null
  selectedFamiliaId: string | null = null
  private sub: Subscription | null = null

  constructor(private foodService: FoodService, private authService: AuthService, private usersApi: UsersApiService) {
    // default date to today
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    this.date = `${yyyy}-${mm}-${dd}`
  }

  ngOnInit(): void {
    this.usersApi.getAllFamilyMembers().subscribe({ next: (list) => (this.familiares = list as any), error: (e) => { console.warn('Failed to fetch family members', e); this.familiares = [] } })
    this.sub = this.foodService.entries$.subscribe((items) => {
      this.entries = items
      console.log('[Cuidador Food] entries', items)
    })
  }

  startEdit(e: FoodEntry) {
    this.editingId = e.id
    this.meal = e.meal
    this.description = e.description
    this.time = e.time
    this.date = e.date
    this.selectedFamiliaId = e.targetId || null
  }

  save() {
    if (!this.description || !this.time || !this.selectedFamiliaId || !this.date) return
    const currentUser = this.authService.getCurrentUser()
    if (this.editingId) {
      this.foodService.updateEntry(this.editingId, { meal: this.meal, description: this.description, time: this.time, date: this.date, targetId: this.selectedFamiliaId }).subscribe({
        next: (entry: FoodEntry) => {
          // success — entries$ will be updated by the service, nothing else needed
        },
        error: (err: any) => {
          console.error('Failed to update food entry', err)
          alert('Error updating entry: ' + (err?.message ?? String(err)))
        }
      })
      this.editingId = null
    } else {
      this.foodService.addEntry({ meal: this.meal, description: this.description, time: this.time, date: this.date, addedBy: currentUser?.name || 'Cuidador', addedById: currentUser?.id, targetId: this.selectedFamiliaId }).subscribe({
        next: (entry: FoodEntry) => {
          // created and pushed in service
        },
        error: (err: any) => {
          console.error('Failed to create food entry', err)
          alert('Error adding entry: ' + (err?.message ?? String(err)))
        }
      })
    }
    this.description = ''
    // reset date to today
    const today2 = new Date()
    const yyyy2 = today2.getFullYear()
    const mm2 = String(today2.getMonth() + 1).padStart(2, '0')
    const dd2 = String(today2.getDate()).padStart(2, '0')
    this.date = `${yyyy2}-${mm2}-${dd2}`
    this.time = ''
    this.selectedFamiliaId = null
  }

  remove(id: string) {
    this.foodService.deleteEntry(id).subscribe({
      next: () => { /* entries$ updated by service */ },
      error: (err: any) => {
        console.error('Failed to delete food entry', err)
        alert('Error deleting entry: ' + (err?.message ?? String(err)))
      }
    })
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
