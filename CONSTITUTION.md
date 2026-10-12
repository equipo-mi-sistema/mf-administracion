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

---

## 3. Estructura de Directorios
El repositorio sigue la arquitectura canónica en Angular 20:

```text
administracion/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/           # Integración con @sistema/auth
│   │   │   ├── guards/         # AdminGuard, TeamOwnerGuard
│   │   │   ├── models/         # Role, Team, Member, Invitation, AuditLog Interfaces
│   │   │   └── services/       # AdminService, RoleService, AuditService
│   │   ├── shared/
│   │   │   └── components/     # Catálogo Atómico (atoms, molecules, organism)
│   │   └── pages/
│   │       ├── teams/          # TeamsPage, TeamDetailPage
│   │       ├── roles/          # RolesManagerPage (Acordeón de Permisos)
│   │       ├── members/        # MemberListPage, MemberInviteModalPage
│   │       └── audit/          # AuditLogsPage
│   ├── environments/
│   ├── styles.css
│   ├── tailwind.config.js
│   └── federation.config.js
└── spec/
    ├── CONSTITUTION.md
    ├── SPEC.md
    ├── PLAN.md
    ├── TASKS.md
    └── openapi.yaml