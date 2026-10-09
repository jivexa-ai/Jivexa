# JIVEXA — AI-Powered HealthTech Ecosystem

JIVEXA is an enterprise-grade HealthTech platform designed to connect patients, healthcare professionals, pharmacies, and AI diagnostic tools into a single, unified digital healthcare ecosystem.

---

## 🚀 Architecture Overview

```
JIVEXA/
├── docs/                      # Production & investor documentation
│   ├── PRD.md                 # Product Requirements Document
│   ├── Architecture.md        # System design & multi-tenant RBAC
│   ├── API.md                 # REST API specifications (Auth, JHID, AI)
│   ├── Database.md            # MongoDB Schema & Indexes
│   ├── Deployment.md          # Hosting & CI/CD deployment guide
│   └── Roadmap.md             # Phased product release plan
│
├── public/                    # Static assets & media
│   └── assets/
│       ├── images/            # Brand imagery
│       ├── icons/             # Custom SVG icons
│       ├── animations/        # Intro animations (jivexa-intro.mp4)
│       ├── videos/            # Video collateral
│       └── logos/             # High-res logos
│
├── src/                       # Application Source Code
│   ├── components/
│   │   ├── common/            # Shared reusable helpers
│   │   ├── ui/                # Atomic UI component system (Button, Card, Input, Select, Modal, etc.)
│   │   ├── layout/            # Layout wrappers (PublicLayout, DashboardLayout, ProtectedRoute, SplashScreen)
│   │   ├── patient/           # Patient domain components
│   │   ├── doctor/            # Doctor domain components
│   │   ├── pharmacy/          # Pharmacy domain components
│   │   └── admin/             # Admin domain components
│   │
│   ├── pages/                 # Role-based application views
│   │   ├── public/            # Public marketing & static pages (Home, About, Contact, etc.)
│   │   ├── auth/              # Authentication pages (Login, Signup, Verify, ForgotPassword)
│   │   ├── patient/           # Patient dashboard & health vault pages
│   │   ├── doctor/            # Doctor workstation & consultation pages
│   │   ├── pharmacy/          # Pharmacy fulfillment queue & inventory pages
│   │   └── admin/             # Admin system audit & security pages
│   │
│   ├── context/               # React Context Providers (AuthContext, HealthDataContext, CartContext)
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # AI Assistant & REST API services
│   ├── routes/                # Application route definitions
│   ├── types/                 # TypeScript type definitions
│   ├── constants/             # Global application constants
│   ├── config/                # Environment & runtime configuration
│   └── App.tsx                # Main App entry with hash routing
│
└── tests/                     # Test suites
    ├── unit/                  # Unit test specs
    ├── integration/           # Component integration tests
    └── e2e/                   # End-to-end testing scripts
```

---

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS with custom tokens & micro-interactions (`index.css`)
- **Backend & Auth**: Node.js, Express, MongoDB (Mongoose), JWT & bcrypt
- **AI Integration**: Google Gemini & Groq APIs with streaming for clinical intelligence
- **Icons**: Lucide React

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript check & build production bundle
npm run build
```

---

## 📞 Official Contact

- **Email Inquiries**: [jevixaofficial@gmail.com](mailto:jevixaofficial@gmail.com)
- **Phone Hotline**: +91 9105539049
