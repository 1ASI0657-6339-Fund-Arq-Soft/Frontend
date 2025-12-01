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
        residentDni: [""],
        residentGender: [""],
        
        // Campos de dirección
        residentStreet: [""],
        residentCity: [""],
        residentState: [""],
        residentCountry: [""],
        residentZipCode: [""],

        phone: [""],
        relationship: [""],
        
        // Campos del doctor
        licenseNumber: [""],
        specialty: [""],
        doctorPhone: [""],
        doctorStreet: [""],
        doctorCity: [""],
        doctorState: [""],
        doctorCountry: [""],
        doctorZipCode: [""],
      },
      { validators: this.passwordMatchValidator },
    );

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'familiar') {
        // Validadores para familiar
        this.registerForm.get('residentName')?.setValidators([Validators.required]);
        this.registerForm.get('residentAge')?.setValidators([Validators.required, Validators.min(0)]);
        this.registerForm.get('residentDni')?.setValidators([Validators.required]);
        this.registerForm.get('residentGender')?.setValidators([Validators.required]);
        this.registerForm.get('residentStreet')?.setValidators([Validators.required]);
        this.registerForm.get('residentCity')?.setValidators([Validators.required]);
        this.registerForm.get('residentState')?.setValidators([Validators.required]);
        this.registerForm.get('residentCountry')?.setValidators([Validators.required]);
        this.registerForm.get('residentZipCode')?.setValidators([Validators.required]);
        
        // Limpiar validadores de doctor
        this.registerForm.get('licenseNumber')?.clearValidators();
        this.registerForm.get('specialty')?.clearValidators();
        this.registerForm.get('doctorPhone')?.clearValidators();
        this.registerForm.get('doctorStreet')?.clearValidators();
        this.registerForm.get('doctorCity')?.clearValidators();
        this.registerForm.get('doctorState')?.clearValidators();
        this.registerForm.get('doctorCountry')?.clearValidators();
        this.registerForm.get('doctorZipCode')?.clearValidators();
      } else if (role === 'doctor') {
        // Validadores para doctor
        this.registerForm.get('licenseNumber')?.setValidators([Validators.required]);
        this.registerForm.get('specialty')?.setValidators([Validators.required]);
        this.registerForm.get('doctorPhone')?.setValidators([Validators.required]);
        this.registerForm.get('doctorStreet')?.setValidators([Validators.required]);
        this.registerForm.get('doctorCity')?.setValidators([Validators.required]);
        this.registerForm.get('doctorState')?.setValidators([Validators.required]);
        this.registerForm.get('doctorCountry')?.setValidators([Validators.required]);
        this.registerForm.get('doctorZipCode')?.setValidators([Validators.required]);
        
        // Limpiar validadores de familiar
        this.registerForm.get('residentName')?.clearValidators();
        this.registerForm.get('residentAge')?.clearValidators();
        this.registerForm.get('residentDni')?.clearValidators();
        this.registerForm.get('residentGender')?.clearValidators();
        this.registerForm.get('residentStreet')?.clearValidators();
        this.registerForm.get('residentCity')?.clearValidators();
        this.registerForm.get('residentState')?.clearValidators();
        this.registerForm.get('residentCountry')?.clearValidators();
        this.registerForm.get('residentZipCode')?.clearValidators();
      } else {
        // Limpiar todos los validadores para otros roles
        this.registerForm.get('residentName')?.clearValidators();
        this.registerForm.get('residentAge')?.clearValidators();
        this.registerForm.get('residentDni')?.clearValidators();
        this.registerForm.get('residentGender')?.clearValidators();
        this.registerForm.get('residentStreet')?.clearValidators();
        this.registerForm.get('residentCity')?.clearValidators();
        this.registerForm.get('residentState')?.clearValidators();
        this.registerForm.get('residentCountry')?.clearValidators();
        this.registerForm.get('residentZipCode')?.clearValidators();
        
        this.registerForm.get('licenseNumber')?.clearValidators();
        this.registerForm.get('specialty')?.clearValidators();
        this.registerForm.get('doctorPhone')?.clearValidators();
        this.registerForm.get('doctorStreet')?.clearValidators();
        this.registerForm.get('doctorCity')?.clearValidators();
        this.registerForm.get('doctorState')?.clearValidators();
        this.registerForm.get('doctorCountry')?.clearValidators();
        this.registerForm.get('doctorZipCode')?.clearValidators();
      }
      
      // Actualizar validaciones
      ['residentName', 'residentAge', 'residentDni', 'residentGender', 'residentStreet', 'residentCity', 'residentState', 'residentCountry', 'residentZipCode',
       'licenseNumber', 'specialty', 'doctorPhone', 'doctorStreet', 'doctorCity', 'doctorState', 'doctorCountry', 'doctorZipCode'].forEach(field => {
        this.registerForm.get(field)?.updateValueAndValidity();
      });
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

  isDoctor(): boolean {
    return this.registerForm.get("role")?.value === "doctor";
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
