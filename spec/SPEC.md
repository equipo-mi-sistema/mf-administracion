# Especificación Técnica (SPEC) - administracion

Documento de requerimientos funcionales redactado en sintaxis estricta EARS (*Easy Approach to Requirements Syntax*).

---

## 1. Gestión de Roles y Permisos (Exclusivo `SUPER_ADMIN`)

- **REQ-ADM-001 (State-Driven)**: Mientras el usuario autenticado posea el identificador de rol `role_id == 'SUPER_ADMIN'`, la microapp deberá habilitar la pantalla `RolesManagerPage` para la creación y edición de Roles Globales.
- **REQ-ADM-002 (Event-Driven)**: Cuando el `SUPER_ADMIN` interactúe con el acordeón de una microapp (`mapeo`, `gestion`, `asistencia`, `transporte`, `conteo`, `administracion`), el sistema deberá desplegar la lista de permisos específicos con sus respectivos interruptores (*switches*) de activación.
- **REQ-ADM-003 (Unwanted Behavior / Excepción)**: Si un usuario con rol `TEAM_OWNER` o `MEMBER` intenta invocar el endpoint o servicio de modificación de roles, entonces el sistema deberá retornar una excepción de acceso prohibido (`403 Forbidden`) y registrar el intento no autorizado en la auditoría.
- **REQ-ADM-004 (State-Driven)**: Mientras un `TEAM_OWNER` consulte el catálogo de roles, el sistema deberá permitirle visualizar la matriz de permisos de cada rol en modo solo lectura.

---

## 2. Gestión de Equipos e Invitaciones

- **REQ-ADM-005 (Event-Driven)**: Cuando un `TEAM_OWNER` o `SUPER_ADMIN` ingrese un correo de Google en `MemberInviteModalPage`, seleccione un `role_id` y asigne un `cargo`, el sistema deberá almacenar un documento en la colección `/invitations` hashed por correo.
- **REQ-ADM-006 (Event-Driven)**: Cuando una Cloud Function detecte un nuevo inicio de sesión cuyo correo coincida con una invitación pendiente (`email_verified == true`), el sistema deberá asignar los Custom Claims ligeros `{ team_id, role_id }`, vincular al usuario en `/users/{uid}` con `status: 'ACTIVE'` y purgar el documento de invitación.
- **REQ-ADM-007 (Event-Driven)**: Cuando el `SUPER_ADMIN` ejecute la transferencia de liderazgo de un equipo, el sistema deberá actualizar la propiedad `leader_uid` en `/teams/{team_id}` y reasignar los Custom Claims al nuevo dueño sin alterar el historial.

---

## 3. Botón Rojo de Desactivación y Auditoría

- **REQ-ADM-008 (Event-Driven)**: Cuando un `SUPER_ADMIN` o `TEAM_OWNER` cambie el estado de un miembro a `INACTIVE`, el sistema deberá actualizar Firestore, forzando la expulsión inmediata de ese usuario mediante el listener `onSnapshot` del Host.
- **REQ-ADM-009 (Ubicuo)**: El sistema deberá registrar en la colección `/audit_logs` todo evento de creación, modificación o eliminación sensible, capturando obligatoriamente: `timestamp_utc`, `executor_uid`, `executor_email`, `ip_address`, `user_agent`, `action`, `target_id`, `previous_state` y `new_state`.

---

## 4. Control Perimetral, Guards y Navegación Multi-Entorno

- **REQ-ADM-010 (State-Driven)**: Mientras un usuario intente acceder a rutas hijas de administración, el guard `AdminAuthGuard` deberá verificar que la sesión esté autenticada en Firebase y que el Custom Claim `role_id` sea `'SUPER_ADMIN'` (o disponga de privilegios administrativos concedidos).
- **REQ-ADM-011 (Unwanted Behavior / Excepción)**: Si un usuario no autenticado o sin rol `SUPER_ADMIN` intenta acceder a una ruta protegida, entonces el `AdminAuthGuard` deberá cancelar la navegación y redirigir:
  1. En entorno integrado de producción (contenedor federado): mediante el servicio `Router` de Angular hacia `/auth/login` o pantalla de acceso no autorizado.
  2. En entorno de desarrollo aislado (puerto 4201): resolviendo la URL base dinámicamente desde `environment.hostBaseUrl` (sin URLs rígidas en el guard).

---

## 5. Gobernanza del "Kill-Switch" de Microfrontends

- **REQ-ADM-012 (State-Driven)**: Mientras el `SUPER_ADMIN` acceda a la vista de control de microfrontends (`MicrofrontendsManagerPage`), el sistema deberá listar todas las microapps registradas en `/config/microfrontends` mostrando su estado actual (`active: boolean`).
- **REQ-ADM-013 (Event-Driven)**: Cuando el `SUPER_ADMIN` alterne el interruptor de disponibilidad de un microfrontend, el `KillSwitchService` deberá actualizar la propiedad `active` en Firestore y emitir inmediatamente un registro en `/audit_logs` con la acción `KILL_SWITCH_TOGGLED`.