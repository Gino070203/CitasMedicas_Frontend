# Avance_03_Frontend

Frontend en **Angular 21** (standalone) que consume la API REST de `Avance_03_Rest` (Spring Boot).

## Requisitos

- **Node.js** `>=22.12.0 <27.0.0` (ver `.nvmrc` = `22.21.1`)
- **npm** `>=10 <12` (ver `package.json` → `packageManager`)

## Instalar y ejecutar

```bash
npm ci          # instala con el package-lock.json exacto
npm start       # ng serve en http://localhost:4200
```

El backend debe estar corriendo en `http://localhost:8080`.

## Documentación para el equipo

- **`GUIA_DE_IMPLEMENTACION.md`** → cómo implementar cada rol (receta + ejemplo de la vista Paciente).
- **`ESTRUCTURA.md`** → estructura de carpetas y división de trabajo.
- La referencia de endpoints está en **`ENDPOINTS.md`** del backend `Avance_03_Rest`.

## Notas de entorno

- Se usa `zone.js` (ya está en `src/main.ts`) para el change detection automático.
- Se aplica `ChangeDetectorRef.detectChanges()` en las respuestas asíncronas por robustez.
- Se precargan los módulos lazy (`withPreloading`).
