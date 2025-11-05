import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-resident-profile",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./resident-profile.component.html",
  styleUrls: ["./resident-profile.component.css"],
})
export class ResidentProfileComponent {}
