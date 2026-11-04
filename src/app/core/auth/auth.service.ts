import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_URL, OAUTH2_LOGIN_URL } from '../config';
import {
  AuthResponse,
  LoginRequest,
  RegistroRequest,
  UsuarioMe,
  VerificarRequest,
} from '../models/auth.model';

interface Sesion {
  token: string;
  correo: string;
  rol: string;
  nombre: string;
  apellido: string;
  idUsuario: number;
}

const SESSION_KEY = 'citas.medicas.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, data)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  registro(data: RegistroRequest): Observable<{ mensaje: string; correo: string }> {
    return this.http.post<{ mensaje: string; correo: string }>(`${API_URL}/auth/registro`, data);
  }

  verificar(data: VerificarRequest): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${API_URL}/auth/verificar`, data);
  }

  me(): Observable<UsuarioMe> {
    return this.http.get<UsuarioMe>(`${API_URL}/usuario/me`);
  }

  guardarSesion(res: AuthResponse): void {
    const sesion: Sesion = {
      token: res.token,
      correo: res.correo,
      rol: res.rol,
      nombre: res.nombre,
      apellido: res.apellido,
      idUsuario: res.idUsuario,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  }

  getToken(): string | null {
    return this.leerSesion()?.token ?? null;
  }

  getRol(): string | null {
    return this.leerSesion()?.rol ?? null;
  }

  getNombre(): string | null {
    return this.leerSesion()?.nombre ?? null;
  }

  getApellido(): string | null {
    return this.leerSesion()?.apellido ?? null;
  }

  getCorreo(): string | null {
    return this.leerSesion()?.correo ?? null;
  }

  getIdUsuario(): number | null {
    return this.leerSesion()?.idUsuario ?? null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  redirectToGoogle(): void {
    window.location.href = OAUTH2_LOGIN_URL;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  private leerSesion(): Sesion | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Sesion;
    } catch {
      return null;
    }
  }
}
