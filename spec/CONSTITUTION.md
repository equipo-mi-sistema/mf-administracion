# Constitución del Repositorio: administracion

## 1. Propósito del Repositorio
`administracion` es la microaplicación responsable del Directorio Activo, la Gobernanza de Equipos (`team_id`), el Control de Acceso Basado en Roles (RBAC), el Flujo de Invitaciones Pre-aprobadas, el "Kill-Switch" de Microfrontends y el Registro Inmutable de Auditoría de Seguridad.

---

## 2. Principios e Invariantes Técnicas

1. **Gobernanza Centralizada de Roles (`SUPER_ADMIN`)**:
   - Únicamente el `SUPER_ADMIN` tiene permisos para crear, editar o eliminar Roles Globales y sus matrices de permisos por microapp.
   - Los `Dueños de Equipo` (`TEAM_OWNER`) pueden consultar los roles creados y asignarlos a sus miembros, pero NUNCA modificar la matriz de permisos.

2. **Invitaciones Pre-aprobadas por Gmail**:
   - Las invitaciones creadas por un `TEAM_OWNER` o `SUPER_ADMIN` quedan pre-aprobadas asociando el correo de Google (`@gmail.com`).
   - Al autenticarse por primera vez con Google OAuth (con `email_verified == true`), el sistema vincula al usuario de forma transparente al `team_id` y `role_id` configurados.

3. **Separación entre Permiso Técnico y Cargo Funcional**:
   - **Permiso Técnico (RBAC)**: Determina qué puede hacer el usuario en el software (controlado por el `role_id`).
   - **Cargo Funcional**: Metadato organizacional libre (ej. *"Coordinador Comuna 2"*, *"Líder de Referidos"*), sin impacto directo en las reglas de seguridad.

4. **Auditoría Inmutable con Trazabilidad IP**:
   - Toda acción administrativa sensible (creación de equipo, cambio de rol, desactivación de usuario, transferencia de liderazgo, alteración de kill-switch) DEBE generar un registro inmutable que incluya la dirección IP (`ip_address`) y agente de usuario del ejecutor.

5. **Consumo de Singleton de Autenticación (`@sistema/auth`)**:
   - `administracion` no reinicializa Firebase Auth de forma independiente ni duplica `initializeApp()`. Consume la instancia y el token de sesión como Singleton a través del core de `@sistema/auth` provisto por el Shell Host vía Native Federation.

6. **Gobernanza del "Kill-Switch" de Microfrontends**:
   - `administracion` es la única microapp autorizada para gestionar la disponibilidad (`active: boolean`) en `/config/microfrontends/{microfrontend_id}`, disparando eventos de auditoría obligatorios y bloqueos perimetrales inmediatos.

7. **Estándar de Estilos Oficial (CSS Puro)**:
   - El estándar transversal es **CSS plano (`src/styles.css`)** con Tailwind CSS v3.4+. No se utilizan preprocesadores Sass (`.scss`) para mantener consistencia con el Shell Host y optimizar tiempos de compilación.

---

## 3. Estructura de Directorios

El repositorio sigue la arquitectura canónica en Angular 20:

```text
administracion/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/           # Integración con Singleton @sistema/auth
│   │   │   ├── guards/         # AdminGuard (SUPER_ADMIN), TeamOwnerGuard
│   │   │   ├── models/         # Role, Team, Member, Invitation, AuditLog, MicrofrontendConfig Interfaces
│   │   │   └── services/       # AdminService, RoleService, AuditService, KillSwitchService
│   │   ├── shared/
│   │   │   └── components/     # Catálogo Atómico (atoms, molecules, organism)
│   │   ├── admin/              # Módulo Funcional y Rutas Expuestas ('./routes')
│   │   └── pages/              # Vistas Standalone (organización flexible por dominio)
│   │       ├── teams/          # TeamsPage, TeamDetailPage
│   │       ├── roles/          # RolesManagerPage (Acordeón de Permisos por Microapp)
│   │       ├── members/        # MemberListPage, MemberInviteModalPage
│   │       ├── kill-switch/    # MicrofrontendsManagerPage
│   │       └── audit/          # AuditLogsPage
│   ├── environments/
│   ├── styles.css              # Directivas oficiales CSS de Tailwind
│   ├── tailwind.config.js
│   └── federation.config.js
├── CONSTITUTION.md
├── SPEC.md
├── PLAN.md
└── TASKS.md
```

> [!NOTE] Autonomía de Estructura de Pantallas
> La organización interna de vistas (bajo `src/app/pages/` o expuesta a través de subdirectorios modulares como `src/app/admin/`) es autónoma y se adapta a la complejidad de la gestión administrativa, garantizando siempre la exposición limpia de rutas mediante `federation.config.js`.