# SIMAE TB — Project Context

## Overview
**SIMAE TB** (Skrining Mandiri Tuberculosis) is a web app for self-screening of TB symptoms
built for Balai Kesehatan TNI Angkatan Laut Lanal Cilacap. Patients submit a screening form
from mobile or web; health officers review results on a dashboard.

---

## Repository layout

```
hanakalita-project/
├── fe/                  # Next.js (App Router, TypeScript, Tailwind)
├── be/                  # Go backend
│   ├── cmd/server/
│   │   └── main.go
│   ├── internal/
│   │   ├── model/       # GORM structs + request types
│   │   ├── database/    # DB connection + AutoMigrate
│   │   ├── router/      # Gin route registration
│   │   ├── handler/     # HTTP handlers (request → response)
│   │   ├── service/     # Business logic (scoring, config)
│   │   └── repository/  # DB queries (GORM)
│   ├── go.mod
│   └── .env
├── reports/             # gitignored — Claude Code prompt files only
│   ├── SERVICE_DISCOVERY_PROMPT.md
│   ├── SITREP_PROMPT.md
│   └── FEATURE_REPORT_PROMPT.md
└── CLAUDE.md
```

---

## Tech stack

| Layer      | Choice                                             |
|------------|----------------------------------------------------|
| Frontend   | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend    | Go, Gin router                                     |
| Database   | PostgreSQL (db: `hanakalita_db`)                   |
| ORM        | GORM with AutoMigrate — no raw migration files     |
| Auth       | Phone number only → JWT (httpOnly cookie)          |
| Container  | Docker Compose (later)                             |

---

## Screening form fields

From the official format (`format_skrining_tbnew.xlsx`):

| Field                   | Key  | Type | Notes                       |
|-------------------------|------|------|-----------------------------|
| Nama                    | —    | string | required                  |
| No HP                   | —    | string | required, replaces NIK    |
| Batuk ≥ 2 minggu        | `q1` | bool | auto-suspek trigger if true |
| Demam hilang timbul     | `q2` | bool |                             |
| Keringat malam          | `q3` | bool |                             |
| Berat badan turun       | `q4` | bool |                             |
| Nafsu makan turun/lemas | `q5` | bool |                             |
| Sesak napas             | `q6` | bool |                             |
| Pembesaran KGB          | `q7` | bool |                             |
| Riwayat penyakit lain   | `q8` | bool | Diabetes/HIV                |
| Kontak serumah TB       | `q9` | bool |                             |

Answers stored as JSONB: `{"q1": true, "q2": false, ..., "q9": true}`
Score and result are computed server-side, never submitted by client.

---

## Scoring logic

Config stored in `screening_configs` table, adjustable from dashboard.

| Key               | Default | Meaning                                     |
|-------------------|---------|---------------------------------------------|
| `q1_auto_suspek`  | `true`  | If q1=true → suspek regardless of score     |
| `score_threshold` | `3`     | Min Yes answers to trigger suspek           |

```
if q1_auto_suspek == true AND answers.q1 == true  →  result = "suspek"
else if score >= score_threshold                   →  result = "suspek"
else                                               →  result = "risiko_rendah"
```

---

## Database schema (GORM models)

Tables already exist in `hanakalita_db`. AutoMigrate is additive only — never drops columns.

```go
type Officer struct {
    ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
    Phone     string    `gorm:"uniqueIndex;not null"`
    Name      string    `gorm:"not null"`
    Role      string    `gorm:"not null;default:officer"` // 'officer' | 'admin'
    IsActive  bool      `gorm:"not null;default:true"`
    CreatedAt time.Time
}

type Screening struct {
    ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
    Phone     string         `gorm:"not null"`
    Name      string         `gorm:"not null"`
    Birthdate *time.Time
    Address   string
    Answers   datatypes.JSON `gorm:"type:jsonb;not null"`
    Score     int            `gorm:"not null"`
    Result    string         `gorm:"not null"` // 'suspek' | 'risiko_rendah'
    CreatedAt time.Time
}

type ScreeningConfig struct {
    Key       string    `gorm:"primaryKey"`
    Value     string    `gorm:"not null"`
    UpdatedAt time.Time
}
```

Seed required in `screening_configs`:
```sql
INSERT INTO screening_configs (key, value, updated_at)
VALUES ('q1_auto_suspek', 'true', NOW()), ('score_threshold', '3', NOW())
ON CONFLICT (key) DO NOTHING;
```

---

## API surface

Base path: `/api/v1`

### Public (no auth)
| Method | Path              | Description              | Status  |
|--------|-------------------|--------------------------|---------|
| POST   | `/screening`      | Submit screening form    | ✅ DONE |
| GET    | `/screening/:id`  | Get one result by UUID   | MISSING |

### Protected (JWT required)
| Method | Path               | Description                 | Status  |
|--------|--------------------|-----------------------------|---------|
| POST   | `/auth/login`      | `{phone}` → JWT cookie      | MISSING |
| POST   | `/auth/logout`     | Clear JWT cookie            | MISSING |
| GET    | `/screenings`      | List all (filterable)       | MISSING |
| GET    | `/dashboard/stats` | Aggregate counts for charts | MISSING |
| GET    | `/config`          | Get scoring config          | MISSING |
| PUT    | `/config`          | Update scoring config       | MISSING |

Query params for `GET /screenings`: `result=suspek|risiko_rendah`, `from=YYYY-MM-DD`, `to=YYYY-MM-DD`, `page=1`, `limit=20`

---

## Frontend pages

| Route               | Auth | Description                          | Status  |
|---------------------|------|--------------------------------------|---------|
| `/`                 | No   | Redirect to `/skrining`              | MISSING |
| `/skrining`         | No   | Patient screening form (mobile-first)| MISSING |
| `/hasil/[id]`       | No   | Public result page by UUID           | MISSING |
| `/login`            | No   | Officer login (phone number only)    | MISSING |
| `/dashboard`        | Yes  | Submissions table + filters + charts | MISSING |
| `/dashboard/[id]`   | Yes  | Full detail of one screening         | MISSING |
| `/dashboard/config` | Yes  | Adjust scoring thresholds            | MISSING |

---

## Backend conventions

- Router: Gin (`github.com/gin-gonic/gin`)
- ORM: GORM (`gorm.io/gorm`) with `gorm.io/driver/postgres`
- Config: `os.Getenv()` via `godotenv.Load()` from `.env`
- JWT: `github.com/golang-jwt/jwt/v5`, stored in httpOnly cookie `simae_token`
- Layer order: `handler → service → repository` — each layer only calls the one below
- Return format:
  ```json
  { "data": ... }
  { "error": "message" }
  ```
- No panics in handlers — always return JSON error responses

---

## Environment variables

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/hanakalita_db?sslmode=disable
JWT_SECRET=changeme_later
PORT=8080
```

---

## What NOT to do

- Do NOT store NIK — phone is the only patient identifier
- Do NOT call `db.Migrator().DropTable()` without explicit discussion
- Do NOT use `sqlx` or raw `database/sql` — GORM only
- Do NOT use `any` in TypeScript
- Do NOT add auth to `/screening` or `/hasil/:id` — must stay public
- Do NOT change scoring logic without confirming first
- Do NOT commit `.env` — only `.env.example`

---

## Deployment (later)

- Server: Ubuntu, Nginx reverse proxy
- `fe` → port 3000, `be` → port 8080
- Docker Compose, same pattern as Isamifoods project

---

## Feature backlog (do not build yet)

- [ ] PDF export per screening result
- [ ] CSV export of filtered screenings
- [ ] Officer admin panel (add/remove officers)
- [ ] Batch/community screening mode
