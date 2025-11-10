import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutComponent } from '../layout/layout.component'
import { FoodService } from '../../../core/services/food.service'
import { AuthService } from '../../../core/services/auth.service'
import type { FoodEntry, MealType } from '../../../core/models/food.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-familiar-food',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css'],
})
export class FoodComponent implements OnInit, OnDestroy {
  entries: FoodEntry[] = []
  grouped: Record<MealType, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [] }
  private sub: Subscription | null = null

  constructor(private foodService: FoodService, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser()
    this.sub = this.foodService.entries$.subscribe((items) => {
      if (currentUser) {
        const filtered = items.filter((e) => e.targetId === currentUser.id)
        this.entries = filtered
        this.grouped = { breakfast: [], lunch: [], dinner: [] }
        for (const e of filtered) {
          this.grouped[e.meal].push(e)
        }
      } else {
        this.entries = []
        this.grouped = { breakfast: [], lunch: [], dinner: [] }
      }
      console.log('[Familiar Food] grouped', this.grouped)
    })
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
