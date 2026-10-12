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
└── permissions: map
    ├── mapeo: array [voters:read, voters:write]
    ├── gestion: array [cases:create]
    └── conteo: array [tally:view]

/invitations/{email_hash}
├── email: string
├── team_id: string
├── role_id: string
├── cargo: string
└── created_at: timestamp

/audit_logs/{log_id}
├── timestamp_utc: timestamp
├── executor_uid: string
├── executor_email: string
├── ip_address: string
├── user_agent: string
├── action: string (ROLE_CREATE, USER_DISABLE, TEAM_TRANSFER)
├── target_id: string
├── previous_state: map
└── new_state: map

[TEAM_OWNER] ➔ Registra email@gmail.com + role_id + Cargo
                              |
                              v
                 [/invitations/{email_hash}]
                              |
              [Usuario inicia sesión con Google]
                              |
                              v
                 [Cloud Function onUserLogin]
                              |
                 (¿Coincide Hash & Verified?)
                              |
                  ┌───────────┴───────────┐
                  ▼                       ▼
                 (SÍ)                    (NO)
                  |                       |
                  ▼                       ▼
        - Asigna Custom Claims       - Bloquea ingreso
        - Crea /users/{uid}          - Muestra Alerta
        - Elimina Invitación