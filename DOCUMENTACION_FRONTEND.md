# Documentación del Frontend Angular — Avance_03_Frontend

Documentación del frontend desarrollado en **Angular 21** (componentes standalone) que consume la API REST de `Avance_03_Rest` (Spring Boot).

---

## Estructura del proyecto

```
Avance_03_Frontend/
├── src/
│   ├── index.html          ----> punto de entrada (carga CDNs: Bootstrap, iconos, flatpickr)
│   ├── main.ts             ----> arranque de la app (importa zone.js)
│   ├── styles.css          ----> estilos globales (prefijos: patient-, auth-, admin-, landing-)
│   └── app/
│       ├── app.ts          ----> componente raíz
│       ├── app.config.ts   ----> proveedores (router, HttpClient, interceptor JWT, preloading)
│       ├── app.routes.ts   ----> rutas principales + guards por rol
│       │
│       ├── core/           ----> código COMPARTIDO
│       │   ├── auth/       ----> auth.service, auth.guard, auth.interceptor
│       │   ├── models/     ----> interfaces TypeScript (espejo de los DTO del backend)
│       │   ├── utils/      ----> helpers (errores, validaciones)
│       │   └── config.ts   ----> API_URL y URL de Google OAuth2
│       │
│       └── features/       ----> pantallas separadas por ROL
│           ├── auth/       ----> login, registro, verificar, oauth2-redirect
│           ├── landing/    ----> página de inicio pública (con botón "Iniciar sesión")
│           ├── paciente/   ----> rol PACIENTE (dashboard, reservar, citas, perfil)
│           ├── medico/     ----> rol MÉDICO (dashboard, diagnóstico)
│           └── admin/      ----> rol ADMIN (dashboard, usuarios, pacientes, médicos,
│                               especialidades, horarios, citas, pagos)
│
├── public/                 ----> archivos estáticos (imágenes, favicon)
├── angular.json            ----> configuración del proyecto Angular
├── package.json            ----> dependencias y scripts (npm start, ng build)
├── .nvmrc                  ----> versión de Node fijada (22.21.1)
├── .npmrc                  ----> config de npm (engine-strict)
└── node_modules/           ----> dependencias instaladas (NO se versiona)
```

**Resumen por carpeta clave:**

| Carpeta | Para qué sirve |
|---------|----------------|
| `src/app/core` | Código compartido (auth, modelos, utilidades) |
| `src/app/features` | Pantallas divididas por rol |
| `src/app/features/auth` | Formularios de autenticación |
| `src/app/features/paciente` | Vistas del paciente/cliente |
| `src/app/features/medico` | Vistas del médico |
| `src/app/features/admin` | Vistas del administrador |
| `public` | Imágenes y assets estáticos |

---

## 4.4.1 Componentes

**¿Cómo se implementaron?**

- Se usaron **componentes standalone de Angular 21** (`@Component` con `imports` y plantilla/estilos en el mismo archivo `.ts`).
- **Un componente = una pantalla**. Cada vista (login, dashboard, formularios, listados) es un componente independiente.
- La comunicación con el backend se hace a través de **servicios** (`HttpClient`), nunca directa desde el componente.
- En las respuestas asíncronas se usa `ChangeDetectorRef.detectChanges()` para garantizar el refresco de la vista.
- Están organizados **por rol** dentro de `src/app/features/`.

**Componentes principales:**

| Componente | Ruta de archivo |
|------------|-----------------|
| Login | `src/app/features/auth/login/login.component.ts` |
| Registro | `src/app/features/auth/registro/registro.component.ts` |
| Landing page | `src/app/features/landing/landing.component.ts` |
| Shell del paciente | `src/app/features/paciente/paciente-shell.component.ts` |
| Reservar cita | `src/app/features/paciente/reservar/reservar.component.ts` |
| Mi perfil | `src/app/features/paciente/perfil/perfil.component.ts` |
| Mis citas | `src/app/features/paciente/citas/citas.component.ts` |
| Shell del médico | `src/app/features/medico/medico-shell.component.ts` |
| Dashboard del médico | `src/app/features/medico/dashboard/dashboard.component.ts` |
| Shell del admin | `src/app/features/admin/admin-shell.component.ts` |
| Dashboard del admin | `src/app/features/admin/dashboard/dashboard.component.ts` |
| Lista de usuarios | `src/app/features/admin/usuarios/usuarios.component.ts` |
| Formulario de usuario | `src/app/features/admin/usuarios/usuario-form.component.ts` |
| Lista de citas | `src/app/features/admin/citas/citas.component.ts` |
| Lista de pagos | `src/app/features/admin/pagos/pagos.component.ts` |

**Definiciones de componentes representativos:**

**Shell del paciente (`paciente-shell.component.ts`)**

Este componente es el **contenedor principal de la vista del paciente**: define la barra de navegación superior (navbar) con el logo del centro médico, los enlaces a las secciones "Inicio", "Reservar cita" y "Mis citas", un chip que muestra el nombre del paciente (que enlaza a "Mi perfil") y el botón "Cerrar sesión". Además incluye el `<router-outlet />`, que es donde se renderizan dinámicamente las páginas hijas (dashboard, reservar, citas y perfil) al navegar. Se comunica con el `AuthService` para obtener el nombre del usuario logueado y para cerrar la sesión.

**Lista de usuarios (`usuarios.component.ts`)**

Este componente es el **listado de usuarios del panel de administración**: muestra una tabla con todos los usuarios del sistema (ID, nombre completo, DNI, correo, teléfono, rol y estado) junto con un buscador y filtros por rol y estado. Desde aquí el administrador puede crear un nuevo usuario (botón "Nuevo usuario"), editar los datos de uno existente, y activar o desactivar cuentas mediante un **modal de confirmación**. Los datos se obtienen del backend a través del `AdminService` y la tabla se ordena por ID de forma ascendente.

**Formulario de usuario (`usuario-form.component.ts`)**

Este componente es el **formulario para crear o editar un usuario** desde el panel de administración. Contiene los campos de datos personales (nombre, apellido, DNI, teléfono y dirección), el correo, el rol asignado (Administrador, Médico o Paciente) y la contraseña (con botón para mostrarla/ocultarla). Funciona con **formularios reactivos** y validaciones (nombre/apellido solo letras, DNI de 8 dígitos, teléfono de 9 dígitos y correo válido). En modo creación la contraseña es obligatoria; en edición se deja vacía para no modificarla. Al guardar, envía los datos al backend (`POST` para crear o `PUT` para actualizar).

---

## 4.4.2 Routing

**¿Cómo se implementó?**

- Se usa el **router de Angular** con **lazy loading** (`loadChildren` para módulos y `loadComponent` para componentes), de modo que cada pantalla se carga solo cuando se visita.
- Las rutas están organizadas **por rol**: `/auth`, `/paciente`, `/medico` y `/admin`.
- Se aplican **guards** para proteger el acceso según el rol (`authGuard` + `roleGuard`).
- Se habilitó la **precarga de módulos** (`withPreloading(PreloadAllModules)`) para que la primera navegación sea rápida.
- La ruta raíz `/` carga la landing y cualquier ruta desconocida redirige a la landing.

**Archivos principales de rutas:**

| Archivo | Contenido |
|---------|-----------|
| `src/app/app.routes.ts` | Rutas raíz, lazy loading y guards por rol |
| `src/app/app.config.ts` | Configura el router (`provideRouter`) y el preloading |
| `src/app/features/auth/auth.routes.ts` | Rutas de autenticación (login, registro, verificar, oauth) |
| `src/app/features/paciente/paciente.routes.ts` | Rutas del paciente (dashboard, reservar, citas, perfil) |
| `src/app/features/medico/medico.routes.ts` | Rutas del médico |
| `src/app/features/admin/admin.routes.ts` | Rutas del administrador |
| `src/app/core/auth/auth.guard.ts` | Guards de autenticación y autorización por rol |

**Rutas raíz (`app.routes.ts`)** — definición:

Este archivo define el **árbol principal de rutas** de la aplicación. La ruta vacía (`/`) carga la landing pública; `/auth` agrupa los formularios de acceso; y `/paciente`, `/medico` y `/admin` cargan de forma diferida (lazy) sus respectivos módulos, protegidos cada uno por `authGuard` (que exige sesión iniciada) y `roleGuard` (que valida el rol correspondiente). Cualquier ruta no encontrada redirige a la landing.

---

## 4.4.3 Formularios

**¿Cómo se implementaron?**

- Se usan **Formularios Reactivos** de Angular (`FormBuilder` + `ReactiveFormsModule` + `nonNullable.group`).
- Cada formulario declara sus campos con sus validadores en el `.ts` y los enlaza en la plantilla con `formControlName`.
- Los botones de guardar se deshabilitan con `[disabled]="form.invalid"` mientras haya errores.
- Al enviar, se construye un objeto con `getRawValue()` que se manda al servicio correspondiente (`POST` para crear, `PUT` para editar).

**Formularios del proyecto:**

| Formulario | Ruta de archivo |
|------------|-----------------|
| Login | `src/app/features/auth/login/login.component.ts` |
| Registro de paciente | `src/app/features/auth/registro/registro.component.ts` |
| Verificar cuenta | `src/app/features/auth/verificar/verificar.component.ts` |
| Perfil del paciente | `src/app/features/paciente/perfil/perfil.component.ts` |
| Usuario (admin) | `src/app/features/admin/usuarios/usuario-form.component.ts` |
| Paciente (admin) | `src/app/features/admin/pacientes/paciente-form.component.ts` |
| Médico (admin) | `src/app/features/admin/medicos/medico-form.component.ts` |
| Especialidad (admin) | `src/app/features/admin/especialidades/especialidad-form.component.ts` |
| Horario (admin) | `src/app/features/admin/horarios/horario-form.component.ts` |
| Cita (admin) | `src/app/features/admin/citas/cita-form.component.ts` |
| Pago (admin) | `src/app/features/admin/pagos/pago-form.component.ts` |

**Formulario de registro (`registro.component.ts`)** — definición:

Este formulario permite al usuario crear su cuenta de paciente. Declara con `FormBuilder` los campos `dni`, `nombre`, `apellido`, `correo`, `telefono`, `direccion` y `password`, cada uno con sus validadores, y se enlaza en la plantilla mediante `formControlName`. Al enviarlo, valida los datos en el frontend y, si son correctos, llama a `AuthService.registro()`, que envía la petición al backend y redirige a la pantalla de verificación del código.

---

## 4.4.4 Validaciones

**¿Cómo se implementaron?**

- Se combinan **validadores nativos de Angular** (`required`, `email`, `minLength`, `min`, `pattern`) con **validadores personalizados**.
- Los patrones de validación están **centralizados** en `src/app/core/utils/validators.ts` (nombre, DNI, teléfono, SIS, etc.), reutilizados en todos los formularios.
- Los mensajes de error se muestran **debajo de cada campo** cuando el usuario escribe o sale del campo (`touched || dirty`), de forma reactiva.
- Ejemplos de reglas aplicadas: DNI de 8 dígitos, teléfono de 9 dígitos, SIS de 8 dígitos, CMP de 6 dígitos, contraseña mínima de 8 caracteres, nombre/apellido solo letras.

**Archivos clave de validación:**

| Archivo | Contenido |
|---------|-----------|
| `src/app/core/utils/validators.ts` | Patrones y validador `soloLetrasValidator` |
| `src/app/features/auth/registro/registro.component.ts` | Validaciones del registro |
| `src/app/features/admin/usuarios/usuario-form.component.ts` | Validaciones del formulario de usuario |
| `src/app/features/admin/medicos/medico-form.component.ts` | Validación de CMP (6 dígitos) |
| `src/app/features/admin/pacientes/paciente-form.component.ts` | Validación de SIS (8 dígitos) y fecha |
| `src/app/features/paciente/perfil/perfil.component.ts` | Validaciones del perfil del paciente |

**Archivo `validators.ts`** — definición:

Este archivo centraliza las **expresiones regulares y validadores reutilizables** de la aplicación. Define patrones como `NOMBRE_PATTERN` (solo letras, tildes y espacios), `DNI_PATTERN` (8 dígitos), `TELEFONO_PATTERN` (9 dígitos) y `IDENTIFICADOR_PATTERN` (para historia clínica y SIS), además del validador personalizado `soloLetrasValidator`. Gracias a esto, todos los formularios usan las mismas reglas sin duplicar código.

**Ejemplo de validación reactiva (nombre):**

```ts
nombre: ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
```

```html
@if ((form.controls.nombre.touched || form.controls.nombre.dirty) && form.controls.nombre.errors?.['pattern']) {
  <small class="text-danger">Solo se permiten letras.</small>
}
```

### Detalle de validaciones por formulario

**1. `registro.component.ts` — líneas 104-112**

```ts
form = this.fb.nonNullable.group({
  dni:       ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
  nombre:    ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
  apellido:  ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
  correo:    ['', [Validators.required, Validators.email]],
  telefono:  ['', [Validators.pattern(TELEFONO_PATTERN)]],
  direccion: [''],
  password:  ['', [Validators.required, Validators.minLength(8)]],
});
```

- `dni` → obligatorio + **8 dígitos**.
- `nombre` / `apellido` → obligatorio + **solo letras** (`NOMBRE_PATTERN`).
- `correo` → obligatorio + **formato email**.
- `telefono` → opcional, pero si se llena debe tener **9 dígitos**.
- `password` → obligatorio + **mínimo 8 caracteres**.

**2. `usuario-form.component.ts` — líneas 147-156**

```ts
form = this.fb.nonNullable.group({
  nombre:    ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
  apellido:  ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
  dni:       ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
  telefono:  ['', [Validators.pattern(TELEFONO_PATTERN)]],
  direccion: [''],
  correo:    ['', [Validators.required, Validators.email]],
  rol:       ['', [Validators.required]],
  password:  [''],
});
```

- `nombre` / `apellido` → obligatorio + **solo letras**.
- `dni` → obligatorio + **8 dígitos**.
- `telefono` → opcional, **9 dígitos**.
- `correo` → obligatorio + **email**.
- `rol` → obligatorio (debe elegir ADMIN/MEDICO/PACIENTE).
- `password` → sin validador aquí (se valida manualmente en `onSubmit`: obligatorio al crear, opcional al editar).

**3. `medico-form.component.ts` — líneas 141-145**

```ts
form = this.fb.nonNullable.group({
  idUsuario:      [0, [Validators.required, Validators.min(1)]],
  cmp:            ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  idEspecialidad: [0, [Validators.required, Validators.min(1)]],
});
```

- `idUsuario` → obligatorio + **mayor que 0** (seleccionar una cuenta).
- `cmp` → obligatorio + **exactamente 6 dígitos** (número de colegiatura).
- `idEspecialidad` → obligatorio + **mayor que 0**.

**4. `paciente-form.component.ts` — líneas 162-170**

```ts
form = this.fb.nonNullable.group({
  idUsuario:                [0, [Validators.required, Validators.min(1)]],
  numeroHistoria:           ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/\S/)]],
  sis:                      ['', Validators.pattern(/^(?:$|\d{8})$/)],
  fechaNacimiento:          ['', [Validators.required, fechaValida]],
  genero:                   ['', [Validators.required, Validators.pattern(/^(MASCULINO|FEMENINO|OTRO)$/)]],
  direccion:                ['', Validators.maxLength(100)],
  numeroHistoriaVerificado: [false], sisVerificado: [false],
});
```

- `numeroHistoria` → obligatorio + **máx. 20 caracteres** + **no vacío** (`/\S/`).
- `sis` → opcional, pero si se llena debe tener **8 dígitos** (sin letras).
- `fechaNacimiento` → obligatorio + `fechaValida` (**fecha válida y no futura**).
- `genero` → obligatorio + solo `MASCULINO`/`FEMENINO`/`OTRO`.
- `direccion` → opcional + **máx. 100 caracteres**.

**5. `perfil.component.ts` — líneas 237-247**

```ts
form = this.fb.nonNullable.group({
  nombre:          ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
  apellido:        ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
  dni:             ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
  telefono:        ['', [Validators.pattern(TELEFONO_PATTERN)]],
  direccion:       [''],
  fechaNacimiento: ['', [Validators.required]],
  genero:          ['', [Validators.required]],
  numeroHistoria:  ['', [Validators.pattern(IDENTIFICADOR_PATTERN)]],
  sis:             ['', [Validators.pattern(/^(?:$|\d{8})$/)]],
});
```

- `nombre` / `apellido` → obligatorio + **solo letras**.
- `dni` → obligatorio + **8 dígitos**.
- `telefono` → opcional, **9 dígitos**.
- `fechaNacimiento` / `genero` → obligatorios.
- `numeroHistoria` → opcional, **solo letras/números y algunos símbolos** (`IDENTIFICADOR_PATTERN`).
- `sis` → opcional, **8 dígitos**.

---

## 4.4.5 Consumo de APIs REST

**¿Cómo se implementó?**

- Se usa el cliente **`HttpClient`** de Angular para hacer peticiones HTTP (GET, POST, PUT, PATCH) al backend.
- Cada rol tiene su propio **servicio** (`@Injectable({ providedIn: 'root' })`) que centraliza las llamadas y las expone como métodos.
- La URL base está definida en `core/config.ts` (`API_URL = http://localhost:8080/api`).
- Un **interceptor JWT** (`auth.interceptor.ts`) agrega automáticamente la cabecera `Authorization: Bearer <token>` a todas las peticiones y maneja los errores `401`.
- Los **modelos** (`core/models/*`) son interfaces TypeScript que reflejan los DTOs del backend para tipar las respuestas.

**Archivos clave:**

| Archivo | Función |
|---------|---------|
| `src/app/core/config.ts` | URL base de la API y URL de Google OAuth2 |
| `src/app/app.config.ts` | Registra `HttpClient` con el interceptor JWT |
| `src/app/core/auth/auth.interceptor.ts` | Agrega el token JWT y controla el 401 |
| `src/app/core/models/*.ts` | Interfaces que reflejan los DTOs |
| `src/app/core/auth/auth.service.ts` | login, registro, verificar, sesión |
| `src/app/features/paciente/services/paciente.service.ts` | Endpoints del paciente |
| `src/app/features/admin/services/admin.service.ts` | Endpoints del administrador |
| `src/app/features/admin/medicos/medicos.service.ts` | Endpoints de médicos |
| `src/app/features/admin/pacientes/pacientes.service.ts` | Endpoints de pacientes |
| `src/app/features/admin/especialidades/especialidades.service.ts` | Endpoints de especialidades |
| `src/app/features/admin/horarios/horarios.service.ts` | Endpoints de horarios |
| `src/app/features/medico/medico-panel.service.ts` | Endpoints del panel del médico |

**Interceptor JWT (`auth.interceptor.ts`)** — definición:

Este interceptor se ejecuta en cada petición HTTP saliente: obtiene el token guardado en `localStorage` mediante el `AuthService` y, si existe, lo añade en la cabecera `Authorization: Bearer <token>`. Además, si el backend responde con un error `401`, cierra la sesión y redirige al login. Gracias a esto, todos los servicios consumen la API autenticados sin repetir la lógica del token.

**Servicio (`pacientes.service.ts`)** — definición:

Este servicio es el encargado de **comunicarse con la API de pacientes** del administrador. Con `HttpClient` define los métodos `listar` (con filtros), `obtener`, `crear`, `actualizar` y `cambiarEstado`, cada uno apuntando al endpoint correspondiente de `/api/admin/pacientes`. Los componentes consumen estos métodos, de modo que la lógica de red queda separada de la interfaz.
