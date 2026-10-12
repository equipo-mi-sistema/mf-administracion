# Plan de Tareas de Implementación (TASKS) - administracion

- [ ] **Fase 1: Configuración de Proyecto y Exposición Native Federation**
  - [ ] Crear estructura Standalone en Angular 20 acorde a `ARCHITECTURE.md`.
  - [ ] Configurar `federation.config.js` para exponer el módulo de administración al `SISTEMA Host`.

- [ ] **Fase 2: Módulo de Gestión de Roles y Permisos (UI Acordeón)**
  - [ ] Construir `RolesManagerPage` con componentes `AccordionComponent` por microapp.
  - [ ] Implementar switches de activación por cada permiso específico.
  - [ ] Programar guard de protección para asegurar que solo `SUPER_ADMIN` pueda guardar o editar roles.

- [ ] **Fase 3: Módulo de Equipos e Invitaciones Pre-aprobadas**
  - [ ] Diseñar `TeamsPage` y `TeamDetailPage` para visualización y edición del `team_name`.
  - [ ] Construir `MemberInviteModalPage` para ingreso de correo Gmail, selección de rol y cargo.
  - [ ] Desarrollar Cloud Function `onUserLogin` para la verificación del hash de invitación, inyección de Custom Claims y auto-vinculación.

- [ ] **Fase 4: Botón Rojo de Desactivación y Auditoría con IP**
  - [ ] Implementar acción de inhabilitación de usuarios con actualización en tiempo real en Firestore.
  - [ ] Crear `AuditService` para captura automática de `ip_address` (vía Cloud Function / Header) y datos de contexto.
  - [ ] Construir la vista de logs `AuditLogsPage` con la molécula `DataTableComponent` para filtrado por fechas, ejecutor e IP.