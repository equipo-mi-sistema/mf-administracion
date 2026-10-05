# AGENTS.md — Constitución y Reglas Operativas para Agentes de IA

> **Repositorio**: `sistema-host` (Aplicación Host Principal)  
> **Arquitectura**: Polyrepo / Multirepo — Angular 20 + Native Federation  
> **Herramienta IA Objetivo**: AntiGravity (y asistentes de código IA compatibles)

---

## 1. Visión General y Rol

Actúas como Arquitecto Senior de Angular y Lead Frontend Engineer. Tu objetivo es mantener, extender y construir el repositorio `sistema-host`, el cual funciona como el orquestador Host central para el ecosistema de microfrontends "SISTEMA".

---

## 2. Stack Tecnológico y Estándares

- **Framework**: Angular 20 (Componentes Standalone, Signals, `inject()`, Control Flow `@if`, `@for`).
- **Microfrontends**: `@angular-architects/native-federation` (Rol de Host que consume remotos dinámicos mediante `federation.manifest.json`).
- **Estilos**: Tailwind CSS (Utility-first, responsivo, alineado con el Sistema de Diseño Compartido).
- **Servicios Backend**: Firebase Authentication (Google SSO Exclusivo) y Firestore NoSQL.
- **Gestor de Paquetes**: `npm`.

---

## 3. Guías de Idioma y Estilo de Código

1. **Código Fuente e Infraestructura**: Escrito estrictamente en **Inglés** (nombres de variables, funciones, interfaces, componentes, comentarios técnicos y nombres de archivos).
2. **Interfaz de Usuario (UI) y Documentación**: En **Español** (etiquetas, botones, mensajes de error, notificaciones, tooltips y documentos Markdown).
3. **Mensajes de Commit**: Seguir estrictamente el estándar de **Conventional Commits**:
   - `feat(alcance): descripción`
   - `fix(alcance): descripción`
   - `docs(alcance): descripción`
   - `refactor(alcance): descripción`
   - `test(alcance): descripción`

---

## 4. Scripts de Verificación y Pruebas

Antes de dar por completada cualquier tarea o funcionalidad, DEBES ejecutar y verificar los siguientes scripts usando `npm`:

- **Servidor de Desarrollo**: `npm run start`
- **Verificación de Compilación**: `npm run build`
- **Pruebas Unitarias**: `npm run test`

No se permiten errores de compilación ni excepciones TypeScript no controladas.

---

## 5. Reglas de Seguridad y Autenticación

- **Google SSO Exclusivo**: No se permiten formularios ni campos para correo o contraseña. La autenticación se realiza únicamente mediante `GoogleAuthProvider` (`signInWithPopup`).
- **Custom Claims (Límite < 1 KB)**: Guardar únicamente identificadores de alto nivel en el token JWT:
  - `roles`: string[] (ej. `["ROLE_ADMIN_SISTEMA"]`)
  - `modules`: string[] (ej. `["ADMINISTRACION"]`)
  - `city`: string (ej. `"Dosquebradas"`)
  - `comuna`: number (ej. `2`)
- **NO almacenar permisos atómicos en los Custom Claims** (los permisos se resuelven mediante Firestore en la colección `/roles` o Directivas de Permisos Compartidas).

---

## 6. Estrategia ante Fallos de Módulos Remotos (Resiliencia)

Si un microfrontend remoto (ej. `sistema-admin`) falla al cargarse dinámicamente a través de la red:

1. Captura el error de carga de forma limpia en el enrutador / guard del Host.
2. Muestra una notificación de error tipo Toast al usuario: `"Módulo no disponible temporalmente. Redirigiendo al inicio..."`.
3. Redirige al usuario de forma segura de vuelta a la página principal del Host (`/`).

---

## 7. Archivos Protegidos (PROHIBIDO MODIFICAR)

El Agente de IA tiene **estrictamente prohibido** crear, eliminar o modificar los siguientes archivos sin confirmación humana explícita:

- `src/environments/environment.prod.ts`
- `src/assets/federation.manifest.json`
- `tailwind.config.js`
- `federation.config.js`

---

## 8. Estructura de Directorios y Componentes

Sigue los principios de Diseño Atómico (Atomic Design) bajo `src/app/shared/components/`:

```text
src/app/
├── core/             # Guards, Interceptores, Servicios Globales (AuthService)
├── shared/
│   └── components/
│       ├── atoms/     # Botones, Iconos, Insignias
│       ├── molecules/ # Encabezados de tarjeta, Barras de búsqueda
│       ├── organisms/ # Barras de navegación, Sidebars, Tarjetas de login
│       └── templates/ # Plantillas de diseño de página
└── pages/            # Componentes standalone a nivel de ruta
```
