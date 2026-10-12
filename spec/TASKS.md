# Plan de Tareas de Implementación (TASKS) - administracion

> **Documento de Trazabilidad SDD (Spec-Driven Development)**  
> **Microaplicación**: administracion (Remote Angular 20 + Native Federation)  
> **Especificación Base**: [SPEC.md](file:///d:/App's%20Juancho/MI%20SISTEMA/sistema-administracion/spec/SPEC.md)  
> **Diseño Técnico**: [PLAN.md](file:///d:/App's%20Juancho/MI%20SISTEMA/sistema-administracion/spec/PLAN.md)  
> **Gobernanza**: [CONSTITUTION.md](file:///d:/App's%20Juancho/MI%20SISTEMA/sistema-administracion/spec/CONSTITUTION.md)

---

## Matriz de Trazabilidad SDD (SPEC ➔ PLAN ➔ TASK)

| ID Requisito | Descripción Sintética | Fase | Estado |
| :--- | :--- | :---: | :---: |
| **REQ-ADM-001** | Habilitación de `RolesManagerPage` para `SUPER_ADMIN` | Fase 2 | [x] |
| **REQ-ADM-002** | Acordeón por microapp con switches de permisos atómicos | Fase 2 | [x] |
| **REQ-ADM-003** | Excepción 403 Forbidden y registro de auditoría para no-admin | Fase 2 | [x] |
| **REQ-ADM-004** | Modo solo lectura para `TEAM_OWNER` en catálogo de roles | Fase 2 | [x] |
| **REQ-ADM-005** | Invitaciones pre-aprobadas en `/invitations/{email_hash}` | Fase 3 | [x] |
| **REQ-ADM-006** | Contrato de verificación login y Custom Claims `{ team_id, role_id }` | Fase 3 | [x] |
| **REQ-ADM-007** | Transferencia de liderazgo `leader_uid` exclusiva por `SUPER_ADMIN` | Fase 3 | [x] |
| **REQ-ADM-008** | Botón Rojo de inhabilitación (`INACTIVE`) con expulsión Host | Fase 4 | [x] |
| **REQ-ADM-009** | Captura inmutable en `/audit_logs` con IP, user-agent y estados | Fase 4 | [x] |
| **REQ-ADM-010** | Verificación estricta de `role_id == 'SUPER_ADMIN'` en guard | Fase 6 | [x] |
| **REQ-ADM-011** | Redirección multi-entorno desacoplada (Router vs hostBaseUrl) | Fase 6 | [x] |
| **REQ-ADM-012** | Catálogo del Kill-Switch de microfrontends | Fase 5 | [x] |
| **REQ-ADM-013** | Conmutación del Kill-Switch y emisión de evento auditado | Fase 5 | [x] |

---

## Detalle de Fases Completadas

- [x] **Fase 1: Configuración de Proyecto, Singleton de Auth y Estilos CSS**
  - [x] Consumir la instancia y estado de sesión de `@sistema/auth` provisto por el Shell Host vía Native Federation (eliminando duplicación de `initializeApp`).
  - [x] Estandarizar estilos globales en `src/styles.css` con Tailwind CSS puro, eliminando preprocesadores Sass (`.scss`).
  - [x] Exponer `./routes` en `federation.config.js` apuntando a las rutas administrativas de forma limpia.

- [x] **Fase 2: Módulo de Gestión de Roles y Permisos (UI Acordeón por Microapp)**
  - [x] Construir `RolesManagerPage` (`roles-manager-page.component.ts`) estructurada con componentes `AccordionComponent` y `AccordionItemComponent` para cada microapp del ecosistema (`mapeo`, `gestion`, `asistencia`, `transporte`, `conteo`, `administracion`).
  - [x] Implementar switches de activación por cada permiso específico y persistencia en `/roles/{role_id}`.
  - [x] Asegurar que solo usuarios con `role_id == 'SUPER_ADMIN'` puedan crear o guardar modificaciones en la matriz, retornando excepción 403 ante intentos no autorizados.
  - [x] Modo solo lectura habilitado para `TEAM_OWNER` y otros roles.

- [x] **Fase 3: Módulo de Equipos e Invitaciones Pre-aprobadas**
  - [x] Diseñar `TeamsPageComponent` para visualización, edición de `team_name` y transferencia de `leader_uid` en `/teams/{team_id}`.
  - [x] Construir `MemberInviteModalComponent` para ingreso de correo Gmail, selección de `role_id` y `cargo`, persistiendo en `/invitations/{email_hash}`.
  - [x] Desarrollar contrato e integración para verificación del hash de invitación, inyección de Custom Claims ligeros `{ team_id, role_id }` y vinculación en `/users/{uid}` con `status: 'ACTIVE'`.

- [x] **Fase 4: Botón Rojo de Desactivación y Auditoría con IP**
  - [x] Implementar acción de inhabilitación de usuarios (`status: 'INACTIVE'`) con actualización en tiempo real en Firestore en `UserService.deactivateUser()`, forzando su expulsión inmediata en el Host vía listener `onSnapshot`.
  - [x] Crear `AuditService` para captura automática de `ip_address` y datos de contexto (`timestamp_utc`, `executor_uid`, `executor_email`, `ip_address`, `user_agent`, `action`, `target_id`, `previous_state`, `new_state`).
  - [x] Construir la vista de logs `AuditLogsPage` con búsqueda, filtrado por acciones y modal de inspección JSON de diferencias de estado.

- [x] **Fase 5: Gobernanza del "Kill-Switch" de Microfrontends**
  - [x] Crear `KillSwitchService` para consultar y conmutar el campo `active: boolean` en la colección Firestore `/config/microfrontends/modules/{id}`.
  - [x] Construir la pantalla `MicrofrontendsManagerPageComponent` con tarjetas y switches de estado por microapp con modal de confirmación preventivo.
  - [x] Registrar en `/audit_logs` la acción `KILL_SWITCH_TOGGLED` con IP y datos del ejecutor ante cada conmutación.

- [x] **Fase 6: Guards Perimetrales Multi-Entorno**
  - [x] Refactorizar `AdminAuthGuard` para verificar obligatoriamente `claims.role_id === 'SUPER_ADMIN'`, denegando el paso si no posee dicho rol.
  - [x] Implementar estrategia de redirección desacoplada: Angular `Router` para ejecución integrada en producción y `environment.hostBaseUrl` para pruebas aisladas en entorno local (puerto 4201).