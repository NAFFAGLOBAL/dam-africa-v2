# DAM Africa v2

Driver Loan Management Platform for Côte d'Ivoire. Manages driver onboarding, KYC verification, credit scoring, loan applications, and payment tracking.

## Architecture

Monorepo with npm workspaces:

```
apps/api/           → Node.js/Express/TypeScript backend API
apps/admin-web/     → Next.js 14 admin portal (App Router)
apps/driver-mobile/ → Flutter mobile app for drivers
packages/database/  → Shared Prisma schema & migrations (PostgreSQL)
```

## Tech Stack

- **Backend:** Express 4, TypeScript 5.3, Prisma 5.8, JWT auth, Zod/Joi validation
- **Admin Web:** Next.js 14 (App Router), React 18, Tailwind CSS 3.4, shadcn/ui, Zustand, React Query, TanStack Table, Recharts
- **Mobile:** Flutter 3.x, Riverpod
- **Database:** PostgreSQL via Prisma ORM
- **Node version:** >=18.0.0

## Key Commands

```bash
# Development
npm run dev              # Start API + Admin concurrently
npm run dev:api          # Start backend only (tsx watch)
npm run dev:admin        # Start admin web only (port 3000)

# Testing & Quality
npm run test             # Run API tests (Jest)
npm run lint             # ESLint across all TypeScript
npm run format           # Prettier formatting

# Building
npm run build            # Build API (tsc) + Admin (next build)
npm run build:api        # Build backend only
npm run build:admin      # Build admin web only

# Database
npm run db:migrate       # Run Prisma migrations (dev)
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio GUI
```

## Project Structure

### Backend API (`apps/api/src/`)
- `modules/` — Feature modules: auth, users, kyc, loans, credit, payments, vehicles, reports, notifications, admin, settings
- `middleware/` — Express middleware (auth, error handling, rate limiting)
- `config/` — Environment and app configuration
- `utils/` — Shared utilities
- `seed.ts` — Database seeding script

### Admin Web (`apps/admin-web/src/`)
- `app/` — Next.js App Router pages: login, dashboard, drivers, kyc, loans, payments
- `lib/` — API client, utilities

### Database (`packages/database/`)
- `prisma/schema.prisma` — Full data model
- Core models: User, Admin, KYCDocument, Loan, Payment, Vehicle, CreditScoreHistory, ActivityLog
- Admin roles: SUPER_ADMIN, ADMIN, LOAN_OFFICER, FINANCE, SUPPORT

## Conventions

- **TypeScript strict mode** enabled across all packages
- **Path aliases:** `@/*` maps to `src/` in both API and Admin
- **Code style:** ESLint + Prettier (single quotes, semicolons, 100 char width, trailing commas)
- **Testing:** Jest with ts-jest, 70% coverage threshold, tests in `apps/api/tests/`
- **API pattern:** Modular routes → controllers → services → Prisma
- **Localization:** French (Côte d'Ivoire) for driver-facing content

## Agent Teams Guidelines

When working as a team on this project:
- **Backend teammate** should focus on `apps/api/` and `packages/database/`
- **Frontend teammate** should focus on `apps/admin-web/`
- **Mobile teammate** should focus on `apps/driver-mobile/`
- Avoid editing the same files simultaneously — coordinate via task list
- Always run `npm run lint` and `npm run test` before marking tasks complete
- Database schema changes (`packages/database/prisma/schema.prisma`) should be coordinated through the team lead to avoid migration conflicts
