import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ResidentDataService } from "../../../familiar/services/resident-data.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = "";

  roles = [
    { value: "familiar", label: "Familiar" },
    { value: "cuidador", label: "Cuidador" },
    { value: "doctor", label: "Doctor" },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private residentDataService: ResidentDataService,
    private router: Router,
  ) {
    this.registerForm = this.formBuilder.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
        role: ["familiar", Validators.required],

        residentName: [""],
        residentAge: [""],
        residentBirthDate: [""],
        residentCondition: [""],

        phone: [""],
        relationship: [""],
      },
      { validators: this.passwordMatchValidator },
    );

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'familiar') {
        this.registerForm.get('residentName')?.setValidators([Validators.required]);
        this.registerForm.get('residentAge')?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        this.registerForm.get('residentName')?.clearValidators();
        this.registerForm.get('residentAge')?.clearValidators();
      }
      this.registerForm.get('residentName')?.updateValueAndValidity();
      this.registerForm.get('residentAge')?.updateValueAndValidity();
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get("password");
    const confirmPassword = group.get("confirmPassword");

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  isFamiliar(): boolean {
    return this.registerForm.get("role")?.value === "familiar";
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = "";

    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const { confirmPassword, ...registerData } = this.registerForm.value;

    console.log('Attempting to register with data:', registerData);
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading = false;
        
        // Registro exitoso, redirigir al login
        this.router.navigate(["/login"], { 
          queryParams: { 
            registered: 'true', 
            email: registerData.email 
          } 
        });
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.error = error.message || "Error al registrarse";
        this.loading = false;
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(["/login"]);
  }
}
