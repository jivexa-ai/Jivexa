# JIVEXA Database Specification (Supabase PostgreSQL)

## 1. Overview
JIVEXA uses **Supabase PostgreSQL** as its exclusive primary relational database for user accounts, credentials, role verification profiles, digital health identities, appointments, prescriptions, pharmacy orders, and ambulance dispatches.

## 2. Tables & Schema

### 1. `public.users` Table
Managed via `backend/src/services/supabaseDbService.js`.

| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique user UUID |
| `role_id` | TEXT | Unique | Prefix-based unique role identifier (e.g. `DOC-12345`, `PAT-67890`) |
| `name` | TEXT | Required | Full legal name |
| `age` | INTEGER | Optional | Age in years |
| `email` | TEXT | Required, Unique, Lowercase | Primary contact and login identifier |
| `phone` | TEXT | Optional | Contact phone number |
| `health_id` | TEXT | Optional | Associated canonical Health ID |
| `password` | TEXT | Required | Bcrypt salted hash (12 salt rounds) |
| `role` | TEXT | Enum | `PATIENT`, `DOCTOR`, `PHARMACY`, `AMBULANCE_PARTNER`, `ADMIN` |
| `email_verified`| BOOLEAN | Default: true | Email OTP verification status |
| `verified` | BOOLEAN | Default: true | General account verification flag |
| `account_status`| TEXT | Enum | `PENDING_EMAIL_VERIFICATION`, `ACTIVE`, `VERIFIED`, `REJECTED`, etc. |
| `failed_login_attempts` | INTEGER | Default: 0 | Consecutive failed login count |
| `lock_until` | TIMESTAMPTZ | Optional | Temporary lockout timestamp for brute-force mitigation |
| `professional_details` | JSONB | Optional | Doctor NMC registration, council, qualifications, specialty |
| `vehicle_details` | JSONB | Optional | Ambulance vehicle number, category, permit, hospital partner |
| `license_details` | JSONB | Optional | Pharmacy drug license number, GSTIN, pharmacist name |
| `usage` | JSONB | Optional | AI token tracking (`tokenUsed`, `tokenLimit`, `resetAt`, `totalTokenUsed`) |
| `created_at` | TIMESTAMPTZ | Timestamp | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Timestamp | Last record update timestamp |

### 2. `public.health_ids` Table
Managed via `backend/src/services/supabaseDbService.js`.

| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique row UUID |
| `health_id` | TEXT | Required, Unique, Uppercase, Indexed | Formatted Digital Health ID (e.g. `JIV-2026-XXXXXX`) |
| `user_id` | TEXT | Required | Associated user account ID |
| `full_name` | TEXT | Required | Patient full name |
| `date_of_birth` | TEXT | Optional | Date of birth (YYYY-MM-DD) |
| `gender` | TEXT | Optional | `Male`, `Female`, `Other`, `Prefer not to say`, `Unspecified` |
| `phone_number` | TEXT | Optional | Contact phone number |
| `email` | TEXT | Lowercase | Patient contact email |
| `blood_group` | TEXT | Optional | Blood group (e.g. `O+`, `B+`) |
| `emergency_contact` | JSONB | Optional | Emergency contact details |
| `address` | TEXT | Optional | Patient address |
| `health_profile` | JSONB | Optional | Allergies, chronic conditions, vitals |
| `created_at` | TIMESTAMPTZ | Timestamp | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Timestamp | Last update timestamp |

### 3. Other Core Tables
- `public.appointments`: Appointments and consultation scheduling.
- `public.prescriptions`: Clinical digital prescriptions.
- `public.pharmacy_orders`: Pharmacy medicine orders and deliveries.
- `public.ambulance_requests`: Emergency ambulance dispatches.

## 3. Database Security & Connection
- Connection credentials configured via `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.
- Passwords hashed before storage with bcrypt using 12 salt rounds.
- JWT tokens signed with backend secret `JWT_SECRET` and transmitted via HTTP-only secure cookies or `Authorization: Bearer` headers.
- Zero fallback to MongoDB or unpersisted memory.
