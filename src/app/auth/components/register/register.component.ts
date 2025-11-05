import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  registerForm: FormGroup
  loading = false
  submitted = false
  error = ""

  roles = [
    { value: "familiar", label: "Familiar" },
    { value: "cuidador", label: "Cuidador" },
    { value: "developer", label: "Developer" },
  ]

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.formBuilder.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
        role: ["familiar", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  get f() {
    return this.registerForm.controls
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get("password")
    const confirmPassword = group.get("confirmPassword")

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }
    return null
  }

  onSubmit(): void {
    this.submitted = true
    this.error = ""

    if (this.registerForm.invalid) {
      return
    }

    this.loading = true
    const { confirmPassword, ...registerData } = this.registerForm.value

    this.authService.register(registerData).subscribe({
      next: (response) => {
        const user = response.user
        if (user.role === "familiar") {
          this.router.navigate(["/familiar/dashboard"])
        } else if (user.role === "cuidador") {
          this.router.navigate(["/cuidador/dashboard"])
        } else if (user.role === "developer") {
          this.router.navigate(["/developer/dashboard"])
        }
      },
      error: (error) => {
        this.error = error.message || "Error al registrarse"
        this.loading = false
      },
    })
  }

  goToLogin(): void {
    this.router.navigate(["/login"])
  }
}
