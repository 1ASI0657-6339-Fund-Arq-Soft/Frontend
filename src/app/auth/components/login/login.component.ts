import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { API_CONFIG } from '../../../core/config/api-config'


@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loginForm: FormGroup
  loading = false
  submitted = false
  error = ""

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  fillDoctorCredentials(): void {
    this.loginForm.patchValue({
      email: 'doctor@test.com',
      password: 'password123',
    })
  }

  get f() {
    return this.loginForm.controls
  }

  onSubmit(): void {
    this.submitted = true
    this.error = ""

    if (this.loginForm.invalid) {
      return
    }

    this.loading = true
    const payload = { username: this.loginForm.value.email, password: this.loginForm.value.password }

    // Use remote IAM if enabled in config
    if (API_CONFIG.useRemoteAuth) {
      this.authService.signInRemote(payload as any).subscribe({
        next: (response) => {
          const user = response.user
          this.redirectByRole(user.role)
        },
        error: (error) => {
          this.error = error?.message ?? "Error al iniciar sesión (IAM)"
          this.loading = false
        },
      })
      return
    }

    // fallback to local/mock auth
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => this.redirectByRole(response.user),
      error: (error) => {
        this.error = error.message || "Error al iniciar sesión"
        this.loading = false
      },
    })
  }

  fillFamiliarCredentials(): void {
    this.loginForm.patchValue({
      email: "familiar@test.com",
      password: "password123",
    })
  }

  fillCuidadorCredentials(): void {
    this.loginForm.patchValue({
      email: "cuidador@test.com",
      password: "password123",
    })
  }

  private redirectByRole(user: any) {
    if (!user) return
    if (user.role === 'familiar') this.router.navigate(['/familiar/dashboard'])
    else if (user.role === 'cuidador') this.router.navigate(['/cuidador/dashboard'])
    else if (user.role === 'doctor') this.router.navigate(['/doctor/gestion-citas'])
  }

  // Developer role removed
}
