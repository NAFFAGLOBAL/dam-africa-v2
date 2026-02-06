# DAM Africa Platform v2

🚗 **World-Class Driver Loan Management Platform for Côte d'Ivoire**

Built from scratch with excellence. Better than Robinhood. Better than Uber.

---

## 🎯 Vision

Enable ride-sharing drivers in Côte d'Ivoire to access vehicle financing based on their performance and creditworthiness. Mobile-first. Elegant. Fast. Trustworthy.

---

## 🏗️ Architecture

```
dam-africa-v2/
├── apps/
│   ├── api/              # Node.js + Express + TypeScript + Prisma
│   ├── admin-web/        # Next.js 14 Admin Portal
│   └── driver-mobile/    # Flutter Mobile App
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── database/         # Prisma schema + migrations
├── docs/                 # Architecture & API documentation
└── scripts/              # Build & deployment scripts
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | Flutter 3.x (iOS & Android) |
| **Admin Web** | Next.js 14 + Tailwind + shadcn/ui |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Auth** | JWT with refresh tokens |
| **Storage** | Cloudinary (KYC documents) |
| **Cache** | Redis |
| **Queue** | Bull |
| **Deployment** | Railway (API) + Vercel (Web) + Stores (Mobile) |

---

## 📊 Key Features

### Driver Mobile App (Flutter)
- 🎨 **Apple-standard UI** - Smooth animations, delightful UX
- 📱 **Offline-first** - Works without internet, syncs when online
- 🔐 **KYC Verification** - Document upload with live validation
- 💳 **Loan Management** - Apply, track, repay loans
- 📈 **Credit Score** - Real-time score with improvement tips
- 💰 **Payments** - Wave, Orange Money integration
- 🇫🇷 **French Language** - Complete localization

### Admin Web Portal (Next.js)
- 📊 **Comprehensive Dashboard** - Real-time KPIs
- 👥 **Driver Management** - Search, filter, manage drivers
- ✅ **KYC Review** - Side-by-side document verification
- 💵 **Loan Approval** - Fast workflow, risk assessment
- 💸 **Payment Tracking** - Collections, reconciliation
- 📈 **Reports & Analytics** - Export to PDF/Excel
- 🔒 **Role-based Access** - Admin, Finance, Support roles

### Backend API
- 🎯 **RESTful API** - Clean, documented endpoints
- 🔒 **Secure** - JWT auth, rate limiting, validation
- 📊 **Credit Scoring Engine** - Automated calculations
- 🔌 **Configurable Integrations** - Yango, Wave, Uffizio
- 📝 **Audit Logging** - Complete activity tracking
- 🚀 **Scalable** - Built to handle 10,000+ drivers

---

## 🌍 Target Market

**Phase 1 (MVP):** Côte d'Ivoire
- Primary: Abidjan
- Secondary: Bouaké, Yamoussoukro
- Language: French
- Currency: XOF (West African CFA Franc)

**Phase 2 (Expansion):** West Africa
- Senegal, Mali (XOF)
- Ghana (GHS)
- Nigeria (NGN)

---

## 💳 Credit Scoring System

### Formula
```
Total Score = (
  Payment History × 0.35 +
  Loan Utilization × 0.30 +
  Account Age × 0.15 +
  Driving Performance × 0.10 +
  KYC Completeness × 0.10
)
```

### Rating Thresholds
| Rating | Score Range | Max Loan Amount |
|--------|-------------|-----------------|
| A | 800-1000 | 2,000,000 XOF |
| B | 650-799 | 1,500,000 XOF |
| C | 500-649 | 1,000,000 XOF |
| D | 350-499 | 500,000 XOF |
| E | 0-349 | Not eligible |

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Flutter 3.x
- PostgreSQL (or Supabase account)
- Redis (optional, for caching)

### Quick Start

**1. Clone Repository**
```bash
git clone https://github.com/NAFFAGLOBAL/dam-africa-v2.git
cd dam-africa-v2
```

**2. Install Dependencies**
```bash
# Root dependencies
npm install

# Backend
cd apps/api && npm install

# Admin Web
cd apps/admin-web && npm install

# Mobile (Flutter)
cd apps/driver-mobile && flutter pub get
```

**3. Setup Environment Variables**
```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/admin-web/.env.local.example apps/admin-web/.env.local

# Edit with your credentials
```

**4. Run Database Migrations**
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

**5. Start Development Servers**
```bash
# Terminal 1: Backend API
cd apps/api && npm run dev

# Terminal 2: Admin Web
cd apps/admin-web && npm run dev

# Terminal 3: Mobile App
cd apps/driver-mobile && flutter run
```

---

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guide](docs/CONTRIBUTING.md)

---

## 🔒 Security

- JWT authentication with refresh tokens
- Bcrypt password hashing
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Audit logging for sensitive actions

---

## 🧪 Testing

```bash
# Backend unit tests
cd apps/api && npm test

# Backend integration tests
cd apps/api && npm run test:integration

# E2E tests
cd apps/api && npm run test:e2e

# Mobile tests
cd apps/driver-mobile && flutter test
```

---

## 📦 Deployment

### Backend (Railway)
```bash
cd apps/api
railway up
```

### Admin Web (Vercel)
```bash
cd apps/admin-web
vercel --prod
```

### Mobile App
```bash
cd apps/driver-mobile

# iOS
flutter build ipa

# Android
flutter build appbundle
```

---

## 🤝 Contributing

This is a private project for NAFFA Global. Internal contributions welcome.

---

## 📄 License

Proprietary - © 2026 NAFFA Global. All rights reserved.

---

## 🏆 Built With Excellence

**Quality Principles:**
- ✅ Mobile-first design
- ✅ Apple-standard UX
- ✅ Sub-3-second load times
- ✅ 80%+ test coverage
- ✅ Comprehensive error handling
- ✅ Full French localization
- ✅ Offline-first architecture
- ✅ Real-time updates

**No rough edges. No "we'll fix later". Production-ready from day one.**

---

**Status:** 🚧 In active development

**Contact:** tech@naffaglobal.com
