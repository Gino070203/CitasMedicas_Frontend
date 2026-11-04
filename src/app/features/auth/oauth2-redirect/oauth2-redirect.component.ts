import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-oauth2-redirect',
  imports: [],
  template: `<p>Autenticando con Google…</p>`,
})
export class Oauth2RedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token');

    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const rol = params.get('rol') ?? 'PACIENTE';
    const sesion: AuthResponse = {
      token,
      correo: params.get('correo') ?? '',
      rol,
      nombre: params.get('nombre') ?? '',
      apellido: params.get('apellido') ?? '',
      idUsuario: 0,
      expiraEnSegundos: 0,
    };

    this.auth.guardarSesion(sesion);

    const destino =
      rol === 'ADMIN'
        ? '/admin/dashboard'
        : rol === 'MEDICO'
          ? '/medico/dashboard'
          : '/paciente/dashboard';

    this.router.navigate([destino]);
  }
}
