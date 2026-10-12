# Especificación Técnica (SPEC) - administracion

Documento de requerimientos funcionales redactado en sintaxis estricta EARS.

---

## 1. Gestión de Roles y Permisos (Exclusivo `SUPER_ADMIN`)

- **REQ-ADM-001 (State-Driven)**: Mientras el usuario autenticado posea el rol `SUPER_ADMIN`, la microapp deberá habilitar la pantalla `RolesManagerPage` para la creación y edición de Roles Globales.
- **REQ-ADM-002 (Event-Driven)**: Cuando el `SUPER_ADMIN` interactúe con el acordeón de una microapp (`mapeo`, `gestion`, `asistencia`, `transporte`, `conteo`), el sistema deberá desplegar la lista de permisos específicos con sus respectivos interruptores (*switches*) de activación.
- **REQ-ADM-003 (Unwanted Behavior / Excepción)**: Si un usuario con rol `TEAM_OWNER` o `MEMBER` intenta invocar el endpoint de modificación de roles, entonces el sistema deberá retornar un código HTTP `403 Forbidden` y registrar el intento no autorizado en la auditoría.
- **REQ-ADM-004 (State-Driven)**: Mientras un `TEAM_OWNER` consulte el catálogo de roles, el sistema deberá permitirle visualizar la matriz de permisos de cada rol en modo solo lectura.

---

## 2. Gestión de Equipos e Invitaciones

- **REQ-ADM-005 (Event-Driven)**: Cuando un `TEAM_OWNER` o `SUPER_ADMIN` ingrese un correo de Google en `MemberInviteModalPage`, seleccione un `role_id` y asigne un `cargo`, el sistema deberá almacenar un documento en la colección `/invitations` hashed por correo.
- **REQ-ADM-006 (Event-Driven)**: Cuando una Cloud Function detecte un nuevo inicio de sesión cuyo correo coincida con una invitación pendiente (`email_verified == true`), el sistema deberá asignar los Custom Claims `{ team_id, role_id }`, vincular al usuario en `/users/{uid}` y purgar el documento de invitación.
- **REQ-ADM-007 (Event-Driven)**: Cuando el `SUPER_ADMIN` ejecute la transferencia de liderazgo de un equipo, el sistema deberá actualizar la propiedad `leader_uid` en `/teams/{team_id}` y reasignar los Custom Claims al nuevo dueño sin alterar el historial.

---

## 3. Botón Rojo de Desactivación y Auditoría

- **REQ-ADM-008 (Event-Driven)**: Cuando un `SUPER_ADMIN` o `TEAM_OWNER` cambie el estado de un miembro a `INACTIVE`, el sistema deberá actualizar Firestore, forzando la expulsión inmediata de ese usuario mediante el listener `onSnapshot` del Host.
- **REQ-ADM-009 (Ubicuo)**: El sistema deberá registrar en la colección `/audit_logs` todo evento de creación, modificación o eliminación sensible, capturando obligatoriamente: `timestamp_utc`, `executor_uid`, `executor_email`, `ip_address`, `user_agent`, `action`, `target_id`, `previous_state` y `new_state`.