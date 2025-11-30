import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit {
  users: User[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.users = this.authService.getFamiliares();
    console.log('Usuarios familiares:', this.users);
  }
}
