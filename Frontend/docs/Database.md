# JIVEXA Database Specification (MongoDB Atlas)

## 1. Overview
JIVEXA uses **MongoDB Atlas** as its exclusive primary document database via Mongoose for user accounts, credentials, role verification profiles, digital health identities, appointments, prescriptions, pharmacy orders, and ambulance dispatches.

## 2. Collections & Schemas

### 1. `users` Collection
Managed via `backend/src/models/User.js` and `backend/src/services/mongoDbService.js`.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | String | Primary Key | Canonical UUID or ObjectId string |
| `roleId` | String | Unique, Indexed | Prefix-based unique role identifier (e.g. `DOC-12345`, `PAT-67890`) |
| `name` | String | Required | Full legal name |
| `age` | Number | Optional | Age in years |
| `email` | String | Required, Unique, Lowercase | Primary contact and login identifier |
| `phone` | String | Optional | Contact phone number |
| `healthId` | String | Optional | Associated canonical Health ID |
| `password` | String | Required | Bcrypt salted hash (12 salt rounds) |
| `role` | String | Enum | `PATIENT`, `DOCTOR`, `PHARMACY`, `AMBULANCE_PARTNER`, `ADMIN` |
| `emailVerified`| Boolean | Default: true | Email verification status |
| `verified` | Boolean | Default: true | General account verification flag |
| `accountStatus`| String | Enum | `PENDING_EMAIL_VERIFICATION`, `ACTIVE`, `VERIFIED`, `REJECTED`, etc. |
| `failedLoginAttempts` | Number | Default: 0 | Consecutive failed login count |
| `lockUntil` | Date | Optional | Temporary lockout timestamp for brute-force mitigation |
| `avatarUrl` | String | Optional | Profile photo stored as Base64 data URL |
| `professionalDetails` | Object | Optional | Doctor NMC registration, council, qualifications, specialty |
| `vehicleDetails` | Object | Optional | Ambulance vehicle number, category, permit, hospital partner |
| `licenseDetails` | Object | Optional | Pharmacy drug license number, GSTIN, pharmacist name |
| `usage` | Object | Optional | AI token tracking (`tokenUsed`, `tokenLimit`, `resetAt`, `totalTokenUsed`) |
| `createdAt` | Date | Timestamp | Account creation timestamp |
| `updatedAt` | Date | Timestamp | Last record update timestamp |

### 2. `healthids` Collection
Managed via `backend/src/models/HealthId.js` and `backend/src/services/mongoDbService.js`.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | String | Primary Key | Canonical UUID or ObjectId string |
| `healthId` | String | Required, Unique, Uppercase, Indexed | Formatted Digital Health ID (e.g. `JIV-2026-XXXXXX`) |
| `userId` | String | Required, Indexed | Associated user account ID |
| `fullName` | String | Required | Patient full name |
| `dateOfBirth` | String | Optional | Date of birth (YYYY-MM-DD) |
| `gender` | String | Optional | `Male`, `Female`, `Other`, `Prefer not to say`, `Unspecified` |
| `phoneNumber` | String | Optional | Contact phone number |
| `email` | String | Lowercase | Patient contact email |
| `bloodGroup` | String | Optional | Blood group (e.g. `O+`, `B+`) |
| `emergencyContact` | Object | Optional | Emergency contact details |
| `address` | String | Optional | Patient address |
| `healthProfile` | Object | Optional | Allergies, chronic conditions, vitals, avatarUrl |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

### 3. Other Core Collections
- `appointments`: Appointments and consultation scheduling (`Appointment.js`).
- `prescriptions`: Clinical digital prescriptions (`Prescription.js`).
- `pharmacyorders`: Pharmacy medicine orders and deliveries (`PharmacyOrder.js`).
- `ambulancerequests`: Emergency ambulance dispatches (`AmbulanceRequest.js`).

## 3. Database Security & Connection
- Connection credentials configured via `MONGO_URI` environment variable.
- Passwords hashed before storage with bcrypt using 12 salt rounds.
- JWT tokens signed with backend secret `JWT_SECRET` and transmitted via HTTP-only secure cookies or `Authorization: Bearer` headers.
- Connection pooling managed with Mongoose (`maxPoolSize: 10`, `serverSelectionTimeoutMS: 5000`).
- Resilient connection lifecycle handling disconnections and reconnects automatically.
