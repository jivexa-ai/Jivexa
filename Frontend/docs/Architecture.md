# JIVEXA Architecture & System Design

## 1. System Overview
JIVEXA is an enterprise, multi-tenant, role-based HealthTech platform connecting Patients, Doctors, Pharmacies, Ambulance Partners, and Administrators in a unified digital ecosystem.

```
+-------------------------------------------------------------------+
|                           JIVEXA WEB APP                          |
|  React 19 + TypeScript + Vite + Custom CSS Tokens (Emerald Theme)  |
+-------------------------------------------------------------------+
       |               |                 |                 |
       v               v                 v                 v
+--------------+ +-----------+   +---------------+   +------------+
| Public Pages | | Auth Flow |   | User Portals  |   | AI Engine  |
| Home, About, | | Node/JWT  |   | Patient, Doc, |   | Health Coach|
| Contact, FAQ | | Express   |   | Pharmacy, Amb |   | Insights   |
+--------------+ +-----------+   +---------------+   +------------+
       |               |                 |                 |
       +---------------+-----------------+-----------------+
                               |
                               v
               +-------------------------------+
               |    Node.js / Express Backend  |
               |  (Auth, JHID, AI Stream API)  |
               +-------------------------------+
                               |
                               v
               +-------------------------------+
               |    MongoDB / MongoDB Atlas    |
               |   (Mongoose ODM - Users, JHID)|
               +-------------------------------+
```

## 2. Directory Structure

```
JIVEXA/
├── backend/                   # Node.js + Express + MongoDB Production Backend
│   └── src/
│       ├── config/            # MongoDB connection (db.js)
│       ├── controllers/       # Auth, Health ID, and AI controllers
│       ├── middleware/        # JWT Authentication middleware
│       ├── models/            # Mongoose Schemas (User, HealthId)
│       ├── routes/            # Express route definitions
│       └── services/          # AI streaming, Email OTP, Token tracking
├── Frontend/                  # React 19 + TypeScript Frontend application
│   ├── docs/                  # System documentation
│   ├── public/                # Static assets (images, icons, animations)
│   └── src/
│       ├── components/        # Reusable UI & Layout components
│       ├── context/           # React Contexts (AuthContext, HealthDataContext, CartContext)
│       ├── pages/             # Role-based views & route pages
│       ├── routes/            # Declarative application routing table
│       ├── services/          # Node.js auth client, JHID client, AI engines
│       └── types/             # Central TypeScript interfaces & enums
└── README.md
```

## 3. State Management Architecture
- **AuthContext**: Manages authentication session state, current user role (`PATIENT`, `DOCTOR`, `PHARMACY`, `ADMIN`, `AMBULANCE_PARTNER`), and user profile data using HTTP cookies and JWT tokens via Node.js backend.
- **HealthDataContext**: Manages health records, appointments, digital prescriptions, ambulance dispatches, and doctor listings.
- **CartContext**: Manages medicine ordering and pharmacy selection cart state.

## 4. Security & Access Control
- Role-based Access Control (RBAC) enforced in the frontend via `<ProtectedRoute allowedRoles={['PATIENT']} />` and backend via JWT authentication middleware (`authMiddleware.js`).
- Cryptographic password hashing using bcrypt with 12 salt rounds.
- Brute-force protection with account locking after consecutive failed login attempts.
- Digital Health ID consent access control for emergency and clinical views.
