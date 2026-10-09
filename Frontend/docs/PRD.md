# JIVEXA Product Requirements Document (PRD)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [About JIVEXA](#about-jivexa)
3. [Objectives](#objectives)
4. [Target Users](#target-users)
5. [User Personas](#user-personas)
6. [Core Features](#core-features)
   - [Patient](#patient)
   - [Doctor](#doctor)
   - [Pharmacy](#pharmacy)
   - [Admin](#admin)
7. [User Journey](#user-journey)
8. [Functional Requirements](#functional-requirements)
9. [Non‑Functional Requirements](#non-functional-requirements)
10. [UI/UX Guidelines](#uiux-guidelines)
11. [Technical Stack](#technical-stack)
12. [Database Overview](#database-overview)
13. [API Overview](#api-overview)
14. [Security](#security)
15. [Performance Strategy](#performance-strategy)
16. [Accessibility](#accessibility)
17. [Future Roadmap](#future-roadmap)
18. [Success Metrics](#success-metrics)
19. [Deployment Strategy](#deployment-strategy)
20. [Appendix](#appendix)

---

## 1. Executive Summary {#executive-summary}

**Product Overview** – JIVEXA is an AI‑powered HealthTech platform that creates a single, connected healthcare ecosystem for patients, doctors, pharmacies, and health organisations. The platform delivers a secure health‑vault, AI‑driven health assistance, seamless prescription workflows, and real‑time care coordination.

**Vision** – To become the trusted digital backbone of modern healthcare in India and beyond, where every health interaction is intelligent, seamless, and patient‑centric.

**Mission** – Enable people to understand, manage, and improve their health through AI‑augmented tools, while empowering clinicians and pharmacies with connected digital workflows.

**Problem Statement** – Healthcare experiences are fragmented: patients juggle multiple portals, doctors manage disparate records, and pharmacies receive handwritten prescriptions that lead to errors.

**Solution** – A unified, end‑to‑end web application that links these stakeholders via secure data sharing, AI insights, and a modern UI.

**Value Proposition** –
- **For Patients**: A single health‑profile, AI health coach, and effortless access to care.
- **For Doctors**: Streamlined patient management, AI‑assisted prescribing, and digital practice tools.
- **For Pharmacies**: Structured digital prescriptions, inventory visibility, and automated fulfillment.
- **For Investors**: Scalable SaaS model with high‑touch AI services, recurring revenue, and a large addressable market in emerging health economies.

---

## 2. About JIVEXA {#about-jivexa}

JIVEXA is built on a modern React + TypeScript front‑end, Node.js/Express REST backend, and MongoDB database. The platform’s core philosophy is **Intelligence – Connection – Care**. AI powers health insights, recommendation engines, and conversational assistance, while secure data pipelines keep the ecosystem tightly connected.

Long‑term, JIVEXA aspires to be the de‑facto digital health layer for India, expanding to tele‑medicine, insurance integration, and wearable health analytics.

---

## 3. Objectives {#objectives}

| Horizon | Goal | Success Indicator |
|---|---|---|
| **Short‑term (0‑6 mo)** | Release stable public beta for patients, doctors, and pharmacies. | >10 k active users, <2 % critical bugs. |
| **Mid‑term (6‑18 mo)** | Introduce AI health assistant and predictive analytics. | AI‑driven recommendations adopted by >30 % of active patients. |
| **Long‑term (18 mo +)** | Expand to tele‑medicine, insurance & wearable integrations; pursue B2B contracts with hospital groups. | 5+ enterprise contracts, >100 k MAUs. |

---

## 4. Target Users {#target-users}

| Segment | Primary Needs | Pain Points |
|---|---|---|
| **Patients** | Easy health record access, AI guidance, appointment booking. | Multiple logins, unreadable prescriptions, fragmented data. |
| **Doctors** | Efficient patient view, digital prescribing, AI decision support. | Paper‑based Rx errors, administrative overhead, limited patient insight. |
| **Pharmacies** | Structured prescriptions, inventory control, order tracking. | Handwritten Rx errors, manual order processing, stockouts. |
| **Hospitals/Clinics** | Centralized data, analytics, compliance. | Disparate systems, data silos, regulatory risk. |
| **Healthcare Organisations** | Scalable platform, reporting, integration capabilities. | Vendor lock‑in, lack of API standardisation. |
| **Admins** | User provisioning, role management, platform health. | Complex permission matrices, limited observability. |

---

## 5. User Personas {#user-personas}

### Persona 1 – *Riya Patel* (Patient)
- **Age**: 29, urban professional
- **Goals**: Track chronic asthma, get quick answers, book specialist.
- **Frustrations**: Scattered medical records, long phone queues.
- **Key Feature**: AI health assistant for symptom triage.

### Persona 2 – *Dr. Amit Sharma* (Doctor)
- **Specialty**: General practitioner
- **Goals**: See concise patient history, write digital prescriptions.
- **Frustrations**: Hand‑written Rx errors, paperwork.
- **Key Feature**: Integrated health‑vault + AI prescription composer.

### Persona 3 – *Neha Singh* (Pharmacy Owner)
- **Business**: Small community pharmacy
- **Goals**: Reduce prescription errors, manage stock.
- **Frustrations**: Illegible prescriptions, manual order entry.
- **Key Feature**: Structured digital Rx inbox with inventory alerts.

### Persona 4 – *Arun Mehta* (Admin)
- **Role**: Platform operations manager at a hospital network.
- **Goals**: Ensure compliance, monitor usage, onboard staff.
- **Frustrations**: Complex role setup, lack of analytics.
- **Key Feature**: Role‑based admin console with dashboards.

---

## 6. Core Features {#core-features}

### Patient {#patient}
- Authentication (JWT-based Auth, secure registration & login)
- Personal Dashboard with health‑summary cards & Digital Health ID (JHID)
- **Health Vault** – secure storage of medical records, labs, imaging
- AI Health Assistant (chat‑based symptom check, wellness tips, report analysis)
- Doctor Search & Appointment Booking
- Digital Prescription viewer & download (PDF & QR)
- Push/Email notifications (appointment reminders, AI alerts)

### Doctor {#doctor}
- Secure Dashboard with patient queue
- Patient Management (view vault, add notes)
- Tele‑consultation schedule (future roadmap)
- Appointment Calendar sync
- **Prescription Composer** – templated, AI‑suggested meds, dosage validation
- Digital Records upload (lab results, imaging)
- Analytics – patient adherence, revenue insights

### Pharmacy {#pharmacy}
- Dashboard with incoming digital prescriptions
- Prescription Processing workflow (Review → Dispense → Ship)
- Inventory Management (stock levels, alerts)
- Order Management – track fulfillment status
- Integration with logistics partners (optional)
- Reporting – prescriptions per day, fulfillment metrics

### Admin {#admin}
- User & Role Management (patients, doctors, pharmacies, staff)
- System Analytics & Health (active users, error rates, SUS scores)
- Configurable Feature Flags
- Audit logs & compliance reports
- Backup & recovery utilities

---

## 7. User Journey {#user-journey}

### Patient Journey
1. **Sign‑up / Login** – secure authentication via JWT and bcrypt credentials.
2. **Generate Health ID** – unique JIVEXA Digital Health ID (JHID) created in MongoDB.
3. **AI Assistant** – ask health questions, receive actionable tips, analyze medical reports.
4. **Search Doctor** – filter by specialty, location, availability.
5. **Book Appointment** – pick slot, receive calendar invite.
6. **Consultation** – doctor prescribes digitally.
7. **View Prescription** – PDF/QR, share with pharmacy.
8. **Order Fulfillment** – select pharmacy, track status.
9. **Feedback** – rate experience, trigger follow‑up.

### Doctor Journey
1. **Login** → Dashboard with pending appointments.
2. **Review Patient Vault** – view prior records and JHID history.
3. **Consultation** – video or in‑person notes.
4. **Compose Prescription** – AI suggestions, dosage checks.
5. **Send Digital Rx** – automatically appears in pharmacy inbox.
6. **Post‑Visit Follow‑up** – set reminders, send AI‑generated care plan.

### Pharmacy Journey
1. **Login** → Inbox of digital prescriptions.
2. **Review Rx** – verify dosage, patient info.
3. **Process Order** – mark *Awaiting Review → Dispensed → Shipped*.
4. **Update Inventory** – auto‑deduct stock, trigger low‑stock alerts.
5. **Notify Patient** – SMS/email with tracking link.
6. **Report** – daily fulfillment metrics.

### Admin Journey
1. **Login** → System health dashboard.
2. **User Provisioning** – create doctor/pharmacy accounts.
3. **Monitor Metrics** – active users, error logs, SLA.
4. **Configure Settings** – enable/disable features, manage API keys.
5. **Generate Compliance Reports** – export for audits.

---

## 8. Functional Requirements {#functional-requirements}

| Feature | Description | Inputs | Outputs | Validation | Business Rules |
|---|---|---|---|---|---|
| **User Authentication** | Secure sign‑up/sign‑in with hashed passwords. | Email/Phone, Password | JWT token, User profile | Email format, password strength, regex validation | Rate‑limit login attempts; bcrypt salted hashing. |
| **Digital Health ID (JHID)** | Generate and verify unique alphanumeric Digital Health ID. | User identity, personal data | JHID identifier, QR payload | Unique index enforcement in MongoDB | 1:1 binding per registered patient user. |
| **AI Health Assistant & Analyzer** | Conversational triage and multi-engine clinical report analysis. | Clinical query / medical report text | Streaming response, structured clinical summaries | Safe prompt bounds, sanitization | Strict medical disclaimers; context-aware clinical reasoning. |
| **Doctor Search** | Filter doctors by specialty, location, rating. | Specialty, location, availability dates | List of doctor cards | Valid search criteria | Role-based verification for registered practitioners. |
| **Digital Prescription** | Generate structured prescription JSON + PDF + QR. | Patient ID, medication list, dosage, instructions | PDF, QR code, API payload | All required fields present, dosage within safe range | Authorized doctor access; tamper-proof signatures. |
| **Pharmacy Order Workflow** | Manage prescription states: *Awaiting Review → Dispensed → Shipped*. | Prescription ID, action (review/dispense/ship) | Updated state, timestamps, notification trigger | State transition valid (cannot ship before dispense) | Role-restricted to verified pharmacy staff. |
| **Admin Role Management** | CRUD operations for platform roles and permissions. | Role name, permission set | Updated role list | Permission IDs exist | Only Super‑Admin can modify Super‑Admin role. |

---

## 9. Non‑Functional Requirements {#non-functional-requirements}

- **Security** – End‑to‑end TLS, JWT authentication, bcrypt password hashing, OWASP Top 10 compliance, HIPAA/DISHA-aligned data privacy.
- **Performance** – Initial page load < 2 s on 3G, API latency ≤ 100 ms, 99.9 % availability SLA.
- **Scalability** – Stateless Node.js backend clustering, MongoDB connection pooling; designed for enterprise workloads.
- **Reliability** – Automated database backups, graceful error handling, CI/CD with automated build checks.
- **Accessibility** – WCAG 2.1 AA compliance, keyboard navigation, ARIA labels.
- **Responsiveness** – Mobile‑first design, responsive breakpoints (320px, 768px, 1024px, 1440px).
- **Maintainability** – Clean modular architecture, TypeScript strict typing, separation of concerns.

---

## 10. UI/UX Guidelines {#uiux-guidelines}

- **Design Language** – Premium HealthTech; soft‑mint backgrounds, deep‑green primary, emerald accents.
- **Typography** – *Inter* (headings) & *Roboto* (body), 400‑700 weights.
- **Color Palette** – `--primary: #0f766e`; `--primary-light: #ccfbf1`; `--secondary: #10b981`; `--background: #f8fafc`.
- **Cards** – Soft borders, elevation on hover, high readability.
- **Buttons** – Pill/rounded, gradient accents, clear focus indicators.
- **Navigation** – Responsive top navigation with clean role-based dashboards.

---

## 11. Technical Stack {#technical-stack}

| Layer | Technology |
|---|---|
| **Front‑end** | React 18, TypeScript, Vite, Vanilla CSS design tokens |
| **State Management** | React Context API (`AuthContext`, `HealthDataContext`, `CartContext`) |
| **Back‑end** | Node.js, Express REST API |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs password hashing |
| **AI Services** | Google Gemini & Groq APIs (SSE streaming + multi-engine analysis) |
| **Icons** | Lucide React |
| **Build & Tooling** | Vite, TypeScript compiler |

---

## 12. Database Overview {#database-overview}

- `users` (id, email, password, role, name, phone, isVerified, createdAt, updatedAt)
- `healthids` (id, userId, healthIdNumber, qrCode, emergencyContacts, vitals, allergies, medicalHistory, createdAt, updatedAt)
- `health_records` (id, patientId, title, category, fileData, date)
- `appointments` (id, patientId, doctorId, date, timeSlot, status, notes)
- `prescriptions` (id, patientId, doctorId, pharmacyId, medications, instructions, status)

---

## 13. API Overview {#api-overview}

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register new user account with hashed password |
| `/api/auth/login` | POST | Public | Authenticate user credentials and issue signed JWT |
| `/api/auth/profile` | GET / PUT | Authenticated | Retrieve and update authenticated user profile |
| `/api/health-id/generate` | POST | Patient | Issue new Digital Health ID card |
| `/api/health-id/:healthId` | GET | Authenticated | Lookup Digital Health ID record |
| `/api/ai/chat/stream` | POST | Authenticated | SSE streaming AI clinical assistant |

---

## 14. Deployment Strategy {#deployment-strategy}

1. **Repository** – Single enterprise repository.
2. **Frontend** – Built via Vite and hosted on modern static/CDN hosting platforms (Vercel, Netlify, Cloudflare).
3. **Backend & Database** – Node.js / Express microservice connected to MongoDB Atlas cluster with encrypted TLS connection pooling.
