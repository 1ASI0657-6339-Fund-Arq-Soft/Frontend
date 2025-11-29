import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutComponent } from '../layout/layout.component'
import { FoodService } from '../../../core/services/food.service'
import { AuthService } from '../../../core/services/auth.service'
import type { FoodEntry, MealType } from '../../../core/models/food.model'
import { Subscription } from 'rxjs'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-familiar-food',
  standalone: true,
  imports: [CommonModule, LayoutComponent, FormsModule],
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css'],
})
export class FoodComponent implements OnInit, OnDestroy {
  entries: FoodEntry[] = []
  allEntries: FoodEntry[] = []
  grouped: Record<MealType, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [] }
  private sub: Subscription | null = null

  startDate: string = ''
  endDate: string = ''

  constructor(private foodService: FoodService, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser()
    this.sub = this.foodService.entries$.subscribe((items) => {
      if (currentUser) {
        const filtered = items.filter((e) => e.targetId === currentUser.id)
        this.allEntries = filtered
        this.applyFilter()
      } else {
        this.entries = []
        this.allEntries = []
        this.grouped = { breakfast: [], lunch: [], dinner: [] }
      }
    })
  }

  applyFilter(): void {
    let filtered = this.allEntries
    if (this.startDate) {
      filtered = filtered.filter((e) => new Date(e.date) >= new Date(this.startDate))
    }
    if (this.endDate) {
      filtered = filtered.filter((e) => new Date(e.date) <= new Date(this.endDate))
    }
    this.entries = filtered
    this.grouped = { breakfast: [], lunch: [], dinner: [] }
    for (const e of this.entries) {
      this.grouped[e.meal].push(e)
    }
  }

  clearFilter(): void {
    this.startDate = ''
    this.endDate = ''
    this.applyFilter()
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
