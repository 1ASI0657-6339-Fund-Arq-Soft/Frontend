import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-patients",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./patients.component.html",
  styleUrls: ["./patients.component.css"],
})
export class PatientsComponent {
  patients = [
    { id: 1, name: "Carlos García", age: 78, room: "101", condition: "Estable", medications: 5 },
    { id: 2, name: "Maria López", age: 82, room: "102", condition: "Estable", medications: 3 },
    { id: 3, name: "Juan Pérez", age: 75, room: "103", condition: "Monitoreado", medications: 4 },
  ]
}
