import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-medico-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="doctor-topbar">
      <a class="brand" routerLink="/medico/dashboard">
        <i class="bi bi-heart-pulse-fill" aria-hidden="true"></i>
        <span>
          Centro Médico
          <small>Buenos Aires de Villa</small>
        </span>
      </a>

      <nav aria-label="Navegación del médico">
        <a
          routerLink="/medico/dashboard"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          <i class="bi bi-grid-1x2" aria-hidden="true"></i>
          Mi panel
        </a>
      </nav>

      <button class="logout" type="button" (click)="cerrarSesion()">
        <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
        <span>Cerrar sesión</span>
      </button>
    </header>

    <router-outlet />

    <footer class="doctor-footer">
      © 2026 Centro Médico Buenos Aires de Villa
      <span>Sistema de Gestión de Citas Médicas</span>
    </footer>
  `,
  styles: [`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      color: #1e293b;
      font-family: Arial, sans-serif;
    }

    .doctor-topbar {
      min-height: 70px;
      padding: 12px clamp(18px, 4vw, 48px);
      display: flex;
      align-items: center;
      gap: 32px;
      color: #fff;
      background: linear-gradient(135deg, #0b2545, #134074);
      box-shadow: 0 4px 15px #00000012;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 11px;
      color: #fff;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.25;
    }

    .brand > i { font-size: 25px; }
    .brand small {
      display: block;
      color: #c8d8e9;
      font-size: 11px;
      font-weight: 400;
    }

    nav { display: flex; align-items: center; flex: 1; }

    nav a {
      padding: 10px 14px;
      border-radius: 8px;
      color: #dce8f5;
      text-decoration: none;
      font-size: 13px;
    }

    nav a:hover,
    nav a.active {
      background: #ffffff20;
      color: #fff;
    }

    .logout {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 13px;
      border: 1px solid #ffffff55;
      border-radius: 8px;
      color: #fff;
      background: #ffffff18;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }

    .logout:hover { background: #ffffff30; }

    .doctor-footer {
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      background: #fff;
      color: #8296a9;
      text-align: center;
      font-size: 12px;
    }

    .doctor-footer span { margin-left: 8px; }

    @media (max-width: 600px) {
      .doctor-topbar { gap: 12px; padding: 12px 16px; }
      nav { justify-content: center; }
      nav a { padding: 9px; }
      .logout { padding: 9px; }
      .logout span { display: none; }
      .doctor-footer span { display: block; margin: 5px 0 0; }
    }
  `],
})
export class MedicoShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}