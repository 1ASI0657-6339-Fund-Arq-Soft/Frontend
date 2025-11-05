import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-medical-records",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./medical-records.component.html",
  styleUrls: ["./medical-records.component.css"],
})
export class MedicalRecordsComponent {
  residentInfo = {
    name: "Carlos García López",
    age: 78,
    bloodType: "O+",
    emergencyContact: "Juan García - 999123456",
    conditions: ["Hipertensión", "Diabetes Tipo 2", "Artritis"],
    currentMedications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "1x diaria" },
      { name: "Metformina", dosage: "500mg", frequency: "2x diaria" },
      { name: "Ibuprofeno", dosage: "200mg", frequency: "Según sea necesario" },
    ],
    allergies: "Penicilina, Ácido Acetilsalicílico",
  }
}
