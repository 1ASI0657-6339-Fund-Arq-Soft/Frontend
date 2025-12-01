export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER'

export interface FoodEntry {
  id: string
  meal: MealType
  description: string
  date: string // YYYY-MM-DD (fecha de ingesta)
  time: string // HH:mm (hora de ingesta)
  createdAt?: string
  addedBy?: string // quien registró (cuidador)
  addedById?: string
  targetId?: string // id del familiar al que va dirigido el registro (opcional)
}
