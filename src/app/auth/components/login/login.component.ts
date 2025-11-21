import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"


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
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        const user = response.user
        if (user.role === "familiar") {
          this.router.navigate(["/familiar/dashboard"])
        } else if (user.role === "cuidador") {
          this.router.navigate(["/cuidador/dashboard"])
        } else if (user.role === "doctor") {
          this.router.navigate(["/doctor/gestion-citas"])
        }
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

  // Developer role removed
}
