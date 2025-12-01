import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ResidentsApiService } from '../services/residents-api.service'
import type { ResidentResource as Resident } from '../models/generated/residents.types'

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-residents-sample',
  templateUrl: './residents-sample.component.html',
})
export class ResidentsSampleComponent implements OnInit {
  residents: Resident[] = []
  loading = false
  error: string | null = null

  constructor(private residentsApi: ResidentsApiService) {}

  ngOnInit(): void {
    this.loadAll()
  }

  loadAll() {
    this.loading = true
    this.error = null
    this.residentsApi.getAll().subscribe({
      next: (res) => {
        this.residents = res
        this.loading = false
      },
      error: (err) => {
        this.error = err?.message ?? 'Failed to load residents'
        this.loading = false
      },
    })
  }

  findByDni(dni: string) {
    this.residentsApi.searchByDni(dni).subscribe({
      next: (r) => alert('Found: ' + JSON.stringify(r)),
      error: (e) => alert('Not found: ' + (e?.message ?? e))
    })
  }
}
