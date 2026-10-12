# Plan de Diseño Técnico (PLAN) - administracion

## 1. Esquema de Colecciones en Firestore

```text
/teams/{team_id}
├── team_name: string (editable)
├── leader_uid: string (Dueño de Equipo)
└── created_at: timestamp

/roles/{role_id}
├── role_name: string
├── created_by: string (SUPER_ADMIN UID)
└── permissions: map (Ecosistema Polyrepo)
    ├── mapeo: array [voters:read, voters:write, territory:manage]
    ├── gestion: array [cases:read, cases:create, cases:manage]
    ├── asistencia: array [events:read, events:register]
    ├── transporte: array [routes:view, gps:track]
    ├── conteo: array [tally:view, e14:upload, e14:verify]
    └── administracion: array [users:manage, roles:manage, audit:view, killswitch:manage]

/users/{uid}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string
├── role_id: string (Vínculo a /roles/{role_id})
├── team_id: string (Vínculo a /teams/{team_id})
├── cargo: string (Metadato organizacional funcional)
├── status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
└── updatedAt: timestamp

/invitations/{email_hash}
├── email: string
├── team_id: string
├── role_id: string
├── cargo: string
└── created_at: timestamp

/config/microfrontends/{microfrontend_id} (Gobernanza Kill-Switch)
├── id: string (ej: 'mapeo')
├── name: string ('Módulo de Mapeo')
├── routePath: string ('mapeo')
├── remoteEntry: string
├── exposedModule: string ('./routes')
├── active: boolean (Kill-Switch: true | false)
├── rolesAllowed: array ['SUPER_ADMIN', 'TEAM_OWNER', 'MEMBER']
├── icon: string
└── order: number

/audit_logs/{log_id}
├── timestamp_utc: timestamp
├── executor_uid: string
├── executor_email: string
├── ip_address: string
├── user_agent: string
├── action: string (ROLE_CREATE, USER_DISABLE, TEAM_TRANSFER, KILL_SWITCH_TOGGLED)
├── target_id: string
├── previous_state: map
└── new_state: map
```

---

## 2. Contrato de Custom Claims y Flujo de Invitaciones

Los Custom Claims del JWT emitidos por la Cloud Function respetan estrictamente el presupuesto liviano (< 1.000 bytes):
`{ team_id: string, role_id: string }`

```text
[TEAM_OWNER / SUPER_ADMIN] ➔ Registra email@gmail.com + role_id + Cargo
                              │
                              ▼
                 [/invitations/{email_hash}]
                              │
              [Usuario inicia sesión con Google]
                              │
                              ▼
                 [Cloud Function onUserLogin]
                              │
                 (¿Coincide Hash & Verified?)
                              │
                  ┌───────────┴───────────┐
                  ▼                       ▼
                 (SÍ)                    (NO)
                  │                       │
                  ▼                       ▼
        - Asigna Claims {team_id, role_id} - Bloquea ingreso
        - Crea /users/{uid} (status: ACTIVE)  - Dispara Zero-Trust
        - Elimina Invitación                  - Alerta de rechazo
```

---

## 3. Arquitectura del Guard Perimetral Multi-Entorno (`AdminAuthGuard`)

Para garantizar robustez profesional tanto en desarrollo local como en producción:

1. **Evaluación de Rol**:
   - Extrae el ID Token y valida que `claims.role_id === 'SUPER_ADMIN'`.
   - Si la condición no se cumple, retorna `false` y cancela la activación de la ruta.
2. **Estrategia de Redirección según Entorno**:
   - **Modo Federado (Producción / Integrado con Shell Host)**: Utiliza el `Router` de Angular (`router.navigate(['/auth/login'])`) sin recargar la ventana del navegador.
   - **Modo Standalone (Desarrollo local puerto 4201)**: En caso de probar la microapp de forma aislada, resuelve la URL del Host dinámicamente mediante `environment.hostBaseUrl` (ej. `http://localhost:4200` en `environment.development.ts`), evitando URLs fijas en el código de producción.

---

## 4. Gobernanza del Kill-Switch de Microfrontends

- **Servicio `KillSwitchService`**:
  - Lee y actualiza documentos en `/config/microfrontends/{id}` en Firestore.
  - Al cambiar `active: boolean`, registra la traza en `/audit_logs` con la IP del cliente y el UID del `SUPER_ADMIN`.
- **Vista `MicrofrontendsManagerPage`**:
  - Lista de microapps federadas con toggle reactivo para alternar disponibilidad en tiempo real.

---

## 5. Integración de Estilos y Dependencias

- **Estilos**: Se estandariza en **CSS plano (`src/styles.css`)** con directivas directas de Tailwind CSS v3.4+, deprecando cualquier archivo `.scss` existente.
- **Singleton de Auth**: El módulo consume la sesión de Firebase Auth compartida desde el Shell Host vía Native Federation (`@sistema/auth`), garantizando un único punto de autenticación.