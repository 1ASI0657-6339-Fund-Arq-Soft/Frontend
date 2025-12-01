import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import type { ResidentResource as Resident } from '../../../core/models/generated/residents.types';
import { ResidentsApiService } from '../../../core/services/residents-api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit {
  residents: Resident[] = [];
  loading = false
  error: string | null = null

  constructor(private authService: AuthService, private residentsApi: ResidentsApiService) {}

  ngOnInit(): void {
    // Prefer to get residents from backend
    this.loading = true
    this.residentsApi.getAll().subscribe({
      next: (list) => {
        this.residents = list
        this.loading = false
      },
      error: (err) => {
        // fallback to local familiar users if backend not available
        console.warn('Residents API error, falling back to mock users', err)
        this.residents = []
        this.error = err?.message ?? 'Could not fetch residents from backend'
        this.loading = false
      }
    })
  }
}
