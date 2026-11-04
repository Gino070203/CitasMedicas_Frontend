# Guía de implementación — Frontend Angular (Avance_03_Frontend)

Esta guía explica **cómo está construido el frontend** y la **receta exacta** para que cada integrante implemente su rol, usando como ejemplo la vista del **PACIENTE** (ya terminada y funcional).

---

## 1. Cómo está organizado el proyecto

El proyecto está separado por **rol** (módulos de feature), no por entidad. Las "entidades" (tipos de datos) viven en `core/models`.

```
src/app/
├── app.ts                  # componente raíz
├── app.config.ts           # proveedores: router + HttpClient + interceptor + preloading
├── app.routes.ts           # rutas raíz (lazy) + guards por rol
│
├── core/                   # COMPARTIDO (no tocar salvo coordinación)
│   ├── auth/               # auth.service, auth.interceptor, auth.guard
│   ├── models/             # interfaces TS (auth, usuario, paciente, medico, cita, pago, etc.)
│   ├── utils/http-error.ts # extraer el mensaje de error del backend
│   └── config.ts           # API_URL y URL de Google OAuth2
│
├── features/
│   ├── auth/               # login, registro, verificar, oauth2-redirect (COMPARTIDO)
│   ├── paciente/           # ROL PACIENTE  → ✔ implementado (usar de ejemplo)
│   ├── medico/             # ROL MÉDICO    → por implementar
│   └── admin/              # ROL ADMIN     → parcialmente implementado
│
└── styles.css              # estilos globales (prefijos: patient-, auth-, admin-)
```

---

## 2. La receta (6 pasos) para implementar una sección

Toda pantalla de un rol sigue **siempre** el mismo patrón:

1. **Modelo** → interfaz en `core/models/` que refleja el DTO del backend (ver `ENDPOINTS.md`).
2. **Servicio** → `features/<rol>/services/<rol>.service.ts` con los llamados `HttpClient`.
3. **Componente(s)** → `features/<rol>/<pantalla>/<pantalla>.component.ts` (lógica + plantilla).
4. **Ruta** → registrar en `features/<rol>/<rol>.routes.ts` con `loadComponent`.
5. **Estilos** → en `styles.css` con el prefijo del rol (`patient-`, `admin-`).
6. **Change detection** → llamar `this.cdr.detectChanges()` tras **cada** respuesta HTTP asíncrona.

### Ejemplo concreto (servicio + componente + ruta)

**Servicio** (`features/paciente/services/paciente.service.ts`):
```ts
@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${API_URL}/paciente/citas`);
  }
}
```

**Componente** (`features/paciente/citas/citas.component.ts`):
```ts
export class PacienteCitasComponent implements OnInit {
  private readonly service = inject(PacienteService);
  private readonly cdr = inject(ChangeDetectorRef);   // ← imprescindible

  citas: Cita[] = [];
  cargando = true;
  error: string | null = null;

  ngOnInit(): void {
    this.service.getCitas().subscribe({
      next: (citas) => {
        this.citas = citas;
        this.cargando = false;
        this.cdr.detectChanges();       // ← SIEMPRE al final del callback
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
```

**Ruta** (`features/paciente/paciente.routes.ts`):
```ts
{ path: 'citas', loadComponent: () => import('./citas/citas.component').then(m => m.PacienteCitasComponent) }
```

> ⚠️ **Importante:** sin `detectChanges()` la vista se queda "cargando" hasta un segundo clic (ya nos pasó). Aplícalo en **todos** los `subscribe` (next y error).

---

## 3. Ejemplo real: la vista PACIENTE

Archivos ya implementados en `features/paciente/`:

| Archivo | Qué hace |
|---------|----------|
| `paciente-shell.component.ts` | Layout: navbar (brand, nav-links, user-chip con nombre, cerrar sesión) + `<router-outlet />` |
| `paciente.routes.ts` | Rutas hijas con `loadComponent` |
| `services/paciente.service.ts` | Todos los llamados al backend (`/api/paciente/**`) |
| `dashboard/dashboard.component.ts` | Hero de bienvenida + tarjetas de acceso |
| `reservar/reservar.component.ts` | Flujo de reserva: especialidad → horario → fecha → turno → confirmar |
| `reservar/flatpickr-disponibilidad.directive.ts` | Calendario flatpickr con días disponibles |
| `citas/citas.component.ts` | Historial de citas (tabla/cards + badges de estado) |
| `perfil/perfil.component.ts` | Ver/editar perfil (formulario reactivo + badges de verificación) |

Para replicarlo, abre cualquiera de estos archivos y copia el patrón (es el mismo en todos).

---

## 4. Dónde trabaja cada integrante

| Integrante | Rol | Carpeta | Estado |
|-----------|-----|---------|--------|
| 1 | PACIENTE | `features/paciente/` | ✔ Completado |
| 2 | MÉDICO | `features/medico/` | ⬜ Por implementar |
| 3 | ADMIN | `features/admin/` | ◐ Parcialmente hecho |

### MÉDICO (Integrante 2) — lo que debes crear

Carpeta `features/medico/` ya tiene el shell y rutas base. Debes implementar:

- `medico-shell.component.ts` → adaptar el layout (ej. topbar + menú).
- `dashboard/dashboard.component.ts` → consumir `GET /api/medico/dashboard`.
- `diagnostico/diagnostico.component.ts` → `GET/PUT /api/medico/citas/{id}/diagnostico`.
- `services/medico.service.ts` → nuevo (sigue el patrón de `paciente.service.ts`).

### ADMIN (Integrante 3) — ya está hecho y lo que falta

Ya implementados: `dashboard`, `usuarios` (lista + formulario), `citas` (lista + formulario), `pagos` (lista + formulario).

Faltan (sigue el mismo patrón de "usuarios" o "citas"):
- `pacientes/` → CRUD `GET/POST/PUT/PATCH /api/admin/pacientes`.
- `medicos/` → CRUD `GET/POST/PUT/PATCH /api/admin/medicos`.
- `especialidades/` → CRUD `/api/admin/especialidades`.
- `horarios/` → CRUD `/api/admin/horarios`.

---

## 5. Convenciones y reglas

1. **Un componente = una pantalla.** Los listados usan `@for`/`@if` (control flow nuevo de Angular).
2. **Servicio por rol:** nunca llames `HttpClient` directo desde un componente; usa el servicio de tu rol.
3. **`detectChanges()`** tras cada respuesta HTTP asíncrona (obligatorio).
4. **Prefijos CSS:** `patient-*` (paciente), `admin-*` (admin). No uses nombres genéricos que choquen.
5. **Confirmaciones con modal** (Bootstrap) en lugar de `confirm()` del navegador (ej. ver `usuarios.component.ts` o `citas.component.ts`).
6. **Errores:** usa `extraerMensajeError(err)` de `core/utils/http-error.ts` para mostrar el `message` del backend.
7. **Formularios reactivos:** importa `ReactiveFormsModule` en el `imports` del componente.
8. **Modelos:** si el backend cambia un DTO, actualiza `core/models/` y avisa al equipo.
9. **Rutas:** siempre `loadComponent` (lazy); el guard de rol ya está en `app.routes.ts`, no lo repitas.

---

## 6. Cómo probar

```bash
# 1. Backend (en Avance_03_Rest)
./mvnw.cmd spring-boot:run

# 2. Frontend (en Avance_03_Frontend)
npm ci
npm start        # http://localhost:4200
```

Credenciales de ejemplo (según la base de datos):
- Admin: `admin123@gmail.com`
- Médico: `javicho123@gmail.com`
- Paciente: `gustavo132@gmail.com`

La referencia completa de endpoints está en **`ENDPOINTS.md`** del proyecto backend `Avance_03_Rest`.
