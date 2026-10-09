# JIVEXA Database Specification (MongoDB & Mongoose ODM)

## 1. Overview
JIVEXA uses **MongoDB** (via **Mongoose ODM**) as its primary document database for user accounts, credentials, role verification profiles, and digital health identities.

## 2. Collections & Schemas

### 1. `users` Collection
Defined in `backend/src/models/User.js`.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique document identifier |
| `roleId` | String | Unique, Sparse | Prefix-based unique role identifier (e.g. `DOC-12345`, `PAT-67890`) |
| `name` | String | Required, Trimmed | Full legal name |
| `age` | Number | Min: 10, Max: 120 | Age in years |
| `email` | String | Required, Unique, Lowercase | Primary contact and login identifier |
| `password` | String | Required | Bcrypt salted hash (12 salt rounds) |
| `role` | String | Enum | `PATIENT`, `DOCTOR`, `PHARMACY`, `AMBULANCE_PARTNER`, `ADMIN` |
| `emailVerified`| Boolean | Default: true | Email OTP verification status |
| `verified` | Boolean | Default: true | General account verification flag |
| `accountStatus`| String | Enum | `PENDING_EMAIL_VERIFICATION`, `ACTIVE`, `VERIFIED`, `REJECTED`, etc. |
| `otpDetails` | Object | Sub-document | `codeHash`, `purpose`, `expiresAt`, `resendAvailableAt`, `attempts` |
| `failedLoginAttempts` | Number | Default: 0 | Consecutive failed login count |
| `lockUntil` | Date | Optional | Temporary lockout timestamp for brute-force mitigation |
| `professionalDetails` | Object | Sub-document | Doctor NMC registration, council, qualifications, specialty |
| `vehicleDetails` | Object | Sub-document | Ambulance vehicle number, category, permit, hospital partner |
| `licenseDetails` | Object | Sub-document | Pharmacy drug license number, GSTIN, pharmacist name |
| `usage` | Object | Sub-document | AI token tracking (`tokenUsed`, `tokenLimit`, `resetAt`, `totalTokenUsed`) |
| `createdAt` | Date | Timestamp | Account creation timestamp |
| `updatedAt` | Date | Timestamp | Last document update timestamp |

### 2. `healthids` Collection
Defined in `backend/src/models/HealthId.js`.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique document identifier |
| `healthId` | String | Required, Unique, Uppercase, Indexed | Formatted Digital Health ID (e.g. `JIV-2026-XXXXXX`) |
| `userId` | ObjectId | Required, Ref: 'User' | Associated user account ObjectId |
| `fullName` | String | Required, Trimmed | Patient full name |
| `dateOfBirth` | String | Default: '' | Date of birth (YYYY-MM-DD) |
| `gender` | String | Enum | `Male`, `Female`, `Other`, `Prefer not to say`, `Unspecified` |
| `phoneNumber` | String | Optional | Contact phone number |
| `email` | String | Lowercase | Patient contact email |
| `bloodGroup` | String | Default: 'Not Set' | Blood group (e.g. `O+ Positive`, `B+ Positive`) |
| `emergencyContact` | Mixed / Object | Optional | Emergency contact details |
| `address` | String | Optional | Patient address |
| `healthProfile` | Mixed / Object | Optional | Allergies, chronic conditions, vitals |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

## 3. Database Security & Connection
- Connection strings configured via `MONGO_URI` environment variable.
- Mongoose connection pooling (`maxPoolSize: 10`, `minPoolSize: 1`).
- Passwords hashed before storage with bcrypt using 12 salt rounds.
- JWT tokens signed with backend secret `JWT_SECRET` and transmitted via HTTP-only secure cookies or `Authorization: Bearer` headers.
