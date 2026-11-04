# Estructura del Frontend Angular — Avance_03_Frontend

Esta carpeta contiene el frontend en **Angular 21** (standalone) que consume la API REST de `Avance_03_Rest` (Spring Boot).

## 1. Cómo levantar el proyecto

```bash
npm ci          # instala dependencias usando el package-lock.json exacto
npm start       # ng serve en http://localhost:4200
```

El backend debe estar corriendo en `http://localhost:8080` (ver `src/app/core/config.ts`).

---

## 2. Árbol de carpetas

```
src/app/
├── app.ts                  # componente raíz
├── app.config.ts           # proveedores: router + HttpClient + interceptor JWT
├── app.routes.ts           # rutas raíz con lazy loading y guards por rol
├── app.html / app.css
│
├── core/                   # COMPARTIDO (no tocar salvo coordinación)
│   ├── auth/
│   │   ├── auth.service.ts     # login, registro, verificar, sesión (localStorage)
│   │   ├── auth.interceptor.ts # agrega "Authorization: Bearer" a cada petición
│   │   └── auth.guard.ts       # authGuard + roleGuard(roles)
│   ├── models/             # interfaces TypeScript que reflejan los DTO del backend
│   │   ├── auth.model.ts
│   │   ├── usuario.model.ts
│   │   ├── paciente.model.ts
│   │   ├── medico.model.ts
│   │   ├── especialidad.model.ts
│   │   ├── horario.model.ts
│   │   ├── cita.model.ts
│   │   ├── pago.model.ts
│   │   ├── dashboard.model.ts
│   │   └── api-error.model.ts
│   └── config.ts           # API_URL y URL de Google OAuth2
│
├── features/               # PANTALLAS (cada integrante trabaja en SU rol)
│   ├── auth/               # Login, Registro, Verificar, OAuth2 (COMPARTIDO)
│   ├── paciente/           # ← ROL CLIENTE (Integrante 1)
│   ├── medico/             # ← ROL MÉDICO  (Integrante 2)
│   └── admin/              # ← ROL ADMIN   (Integrante 3)
│
└── shared/                 # componentes reutilizables (navbar, alertas, tablas...)
```

---

## 3. División de trabajo

| Integrante | Rol | Carpeta | Pantallas |
|-----------|-----|---------|-----------|
| **1 (tú)** | CLIENTE / PACIENTE | `features/paciente/` | Dashboard, Reservar cita, Mis citas, Mi perfil |
| **2** | MÉDICO | `features/medico/` | Dashboard, Agenda, Registro de diagnóstico |
| **3** | ADMIN | `features/admin/` | Dashboard, Usuarios, Pacientes, Médicos, Especialidades, Horarios, Citas, Pagos |

### Pantallas de autenticación (`features/auth/`)
Son **compartidas** y las usan todos los roles: `login`, `registro`, `verificar` y `oauth2-redirect`.
Recomendación: las implementa el **Integrante 1 (CLIENTE)** porque son la puerta de entrada del cliente, pero debe avisar a los demás de los cambios (ya están conectadas al `AuthService`).

---

## 4. Reglas de orden

1. **Cada integrante solo toca su carpeta de rol** (`features/paciente`, `features/medico`, `features/admin`) y las pantallas de auth solo con coordinación.
2. `core/` y `app.routes.ts` son código compartido: cualquier cambio ahí se **comunica al equipo** (idealmente lo hace una sola persona).
3. Para crear una pantalla nueva usa el CLI:
   ```bash
   ng g c features/admin/nueva-pantalla --skip-tests --inline-style --inline-template
   ```
   y luego registra la ruta en el `*.routes.ts` correspondiente.
4. **Nunca** llames a la API directamente desde los componentes; crea un servicio en tu carpeta de rol (ej. `features/paciente/services/`) o usa el `HttpClient` vía un servicio propio.
5. Los modelos (`core/models/`) son la fuente de verdad de los tipos. Si el backend cambia un DTO, actualiza el modelo aquí y avisa.

---

## 5. Cómo funciona la autenticación (ya configurado)

- `POST /api/auth/login` → `AuthService.login()` guarda `{ token, rol, nombre, ... }` en `localStorage`.
- El `auth.interceptor.ts` añade `Authorization: Bearer <token>` a todas las peticiones y, ante un `401`, cierra sesión y redirige a `/auth/login`.
- Los `guards` en `app.routes.ts` protegen cada sección:
  - `/paciente/**` solo con rol `PACIENTE`.
  - `/medico/**` solo con rol `MEDICO`.
  - `/admin/**` solo con rol `ADMIN`.
- Login con Google: `AuthService.redirectToGoogle()` redirige a `/oauth2/authorization/google`; el backend devuelve el token en `/auth/oauth2-redirect`, que lo guarda y navega al panel correcto.

---

## 6. Referencia de endpoints

Ver el archivo **`ENDPOINTS.md`** en el proyecto backend `Avance_03_Rest` (raíz). Ahí está el detalle de cada endpoint, body y respuesta.

---

## 7. Convenciones rápidas

- Componentes standalone con nombre descriptivo: `AdminUsuariosComponent`, `PacienteReservarComponent`, etc.
- Un componente = una pantalla; los elementos repetidos van a `shared/`.
- Fechas en `yyyy-MM-dd` y horas en `HH:mm` (string), tal como las devuelve el backend.
