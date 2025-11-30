import { Component } from '@angular/core';

@Component({
  selector: 'app-alert-button',
  standalone: true,
  template: `
    <button class="alert-btn">Botón de Alerta</button>
  `,
  styles: [`
    .alert-btn {
      background: #ff5252;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }
  `]
})
export class AlertButtonComponent {}
