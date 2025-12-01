import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router, RouterModule, ActivatedRoute } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { API_CONFIG } from '../../../core/config/api-config'


@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  loading = false
  submitted = false
  error = ""
  successMessage = ""

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  ngOnInit() {
    // Verificar si viene del registro
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.successMessage = "Registro exitoso. Ahora puedes iniciar sesión."
        if (params['email']) {
          this.loginForm.patchValue({ email: params['email'] })
        }
      }
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

    console.log('Login form submitted with:', { email: this.loginForm.value.email, useRemoteAuth: API_CONFIG.useRemoteAuth })
    console.log('Sign-in payload:', payload)

    // Use remote IAM if enabled in config
    if (API_CONFIG.useRemoteAuth) {
      this.authService.signInRemote(payload).subscribe({
        next: (response) => {
          console.log('Sign-in successful:', response)
          this.loading = false
          this.redirectByRole(response.user.role)
        },
        error: (error) => {
          console.error('Sign-in failed:', error)
          this.error = error?.message ?? "Error al iniciar sesión"
          this.loading = false
        },
      })
      return
    }

    // fallback to local/mock auth
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false
        this.redirectByRole(response.user.role)
      },
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

  private redirectByRole(role: string) {
    if (role === 'familiar') {
      this.router.navigate(['/familiar/dashboard'])
    } else if (role === 'cuidador') {
      this.router.navigate(['/cuidador/dashboard'])
    } else if (role === 'doctor') {
      this.router.navigate(['/doctor/gestion-citas'])
    } else {
      this.router.navigate(['/familiar/dashboard'])
    }
  }

  // Developer role removed
}
