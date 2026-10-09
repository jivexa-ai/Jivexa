# JIVEXA API & Integration Specifications

## 1. Authentication Endpoints (`/api/auth`)
Served by Node.js / Express backend (`backend/src/routes/authRoutes.js`).

### Endpoints:
- `POST /api/auth/signup`: Registers a new account (validates schema with Zod, hashes password with bcrypt, saves to MongoDB `users` collection, generates JWT token & sets HTTP-only cookie).
- `POST /api/auth/login`: Authenticates user credentials, validates lockout status, matches bcrypt password, returns signed JWT and user profile.
- `POST /api/auth/logout`: Clears session cookie and invalidates client token.
- `GET /api/auth/me`: Validates active JWT cookie / Bearer token and returns authenticated user object.
- `POST /api/auth/send-otp`: Dispatches verification OTP code to user's email.
- `POST /api/auth/verify-otp`: Verifies cryptographic OTP hash and marks account verified.
- `POST /api/auth/submit-verification`: Submits Stage-2 professional/vehicle/drug license credentials for role review.

## 2. Digital Health ID Endpoints (`/api/health-id`)
Served by `backend/src/routes/healthIdRoutes.js`.

### Endpoints:
- `POST /api/health-id`: Generates and registers a unique Digital Health ID document in MongoDB `healthids` collection.
- `GET /api/health-id/me`: Retrieves authenticated user's digital health identity profile.
- `GET /api/health-id/search?healthId=...`: Verifies and looks up emergency health profile by Health ID string.

## 3. AI Health Assistant & Clinical Analyzer (`/api/ai`)
Served by `backend/src/routes/aiRoutes.js`.

### Endpoints:
- `POST /api/ai/chat`: Real-time Server-Sent Events (SSE) streaming chat endpoint with multi-provider fallback (Groq -> OpenAI -> Gemini), rate limiting (10 req/min), and token usage cap enforcement.
- `POST /api/ai/analyze-report`: Real-time clinical laboratory PDF/text report analyzer.
- `GET /api/ai/usage`: Returns user token consumption and quota reset timeline.
- `POST /api/ai/upgrade`: Upgrades user account to Pro subscription tier.
- `GET /api/ai/metrics`: System administrative AI health and throughput metrics.
