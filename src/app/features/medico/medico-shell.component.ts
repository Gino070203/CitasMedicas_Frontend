import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-medico-shell',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header>
      <h2>Panel del Médico</h2>
      <nav>
        <a routerLink="dashboard">Dashboard</a>
      </nav>
      <button (click)="cerrarSesion()">Cerrar sesión</button>
    </header>
    <main>
      <router-outlet />
    </main>
  `,
})
export class MedicoShellComponent {
  private readonly auth = inject(AuthService);

  cerrarSesion(): void {
    this.auth.logout();
    window.location.href = '/auth/login';
  }
}
