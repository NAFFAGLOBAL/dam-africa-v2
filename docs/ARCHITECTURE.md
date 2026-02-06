# DAM Africa v2 - Architecture Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-02-06  
**Status:** In Development

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Security Architecture](#security-architecture)
7. [Scalability Strategy](#scalability-strategy)
8. [Deployment Architecture](#deployment-architecture)

---

## Overview

DAM Africa v2 is a complete rewrite of the driver loan management platform, built from scratch with world-class engineering principles. The platform enables ride-sharing drivers in Côte d'Ivoire to access vehicle financing based on their performance and creditworthiness.

###Key Design Principles

1. **Mobile-First**: 99% of users are on mobile devices
2. **Offline-First**: Core features work without internet
3. **Performance**: Sub-3-second load times, optimized for 3G/4G
4. **Security**: Bank-grade security with JWT, encryption, audit logs
5. **Scalability**: Built to handle 10,000+ drivers
6. **Maintainability**: Clean code, comprehensive tests, clear documentation
7. **Delightful UX**: Apple-standard design, smooth animations

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├──────────────────┬──────────────────┬──────────────────────┤
│   Driver Mobile  │   Admin Web      │   Future: Web Driver │
│   (Flutter)      │   (Next.js 14)   │   (Next.js PWA)      │
└──────────────────┴──────────────────┴──────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         API GATEWAY                          │
│  Rate Limiting │ Auth Middleware │ Request Validation       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
├──────────────────┬──────────────────┬──────────────────────┤
│  Auth Service    │  Loan Service    │  Payment Service     │
│  KYC Service     │  Credit Service  │  Vehicle Service     │
│  Notification    │  Analytics       │  Admin Service       │
└──────────────────┴──────────────────┴──────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
├──────────────────┬──────────────────┬──────────────────────┤
│  PostgreSQL      │  Redis Cache     │  S3/Cloudinary       │
│  (Primary DB)    │  (Sessions)      │  (File Storage)      │
└──────────────────┴──────────────────┴──────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                      │
├──────────────────┬──────────────────┬──────────────────────┤
│  Wave/Orange $   │  Yango Fleet     │  Uffizio GPS         │
│  WhatsApp API    │  SMS Provider    │  Email Service       │
└──────────────────┴──────────────────┴──────────────────────┘
```

### Component Breakdown

#### 1. Driver Mobile App (Flutter)
- **Purpose**: Primary interface for drivers
- **Features**:
  - Registration & Authentication
  - KYC document submission
  - Credit score visualization
  - Loan application & management
  - Payment processing
  - Notifications
- **Offline Capabilities**:
  - View existing data
  - Draft loan applications
  - Queue actions for sync
- **State Management**: Riverpod
- **Local Database**: Hive or Isar

#### 2. Admin Web Portal (Next.js 14)
- **Purpose**: Management interface for admins
- **Features**:
  - Dashboard with KPIs
  - Driver management
  - KYC review & approval
  - Loan approval workflow
  - Payment tracking
  - Reports & analytics
  - System configuration
- **Deployment**: Vercel
- **SSR/SSG**: Server-side rendering for SEO and performance

#### 3. Backend API (Node.js + Express)
- **Purpose**: Core business logic and data management
- **Architecture**: Modular service-based design
- **Modules**:
  - **auth**: Authentication & authorization
  - **users**: Driver management
  - **kyc**: KYC document processing
  - **loans**: Loan lifecycle management
  - **credit**: Credit scoring engine
  - **payments**: Payment processing
  - **vehicles**: Fleet management
  - **notifications**: Multi-channel notifications
  - **admin**: Admin operations
  - **reports**: Analytics & reporting

---

## Technology Stack

### Mobile App (Driver)

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Framework** | Flutter 3.x | Best-in-class animations, single codebase for iOS/Android |
| **Language** | Dart | Type-safe, optimized for mobile performance |
| **State Management** | Riverpod | Modern, scalable, testable |
| **Local Database** | Hive/Isar | Offline-first support, fast queries |
| **HTTP Client** | Dio | Interceptors, retries, caching |
| **Animations** | Rive/Lottie | High-quality custom animations |
| **Push Notifications** | Firebase Cloud Messaging | Reliable, free tier |
| **Analytics** | Firebase Analytics | User behavior tracking |

### Admin Web Portal

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Framework** | Next.js 14 (App Router) | SSR/SSG, optimal performance |
| **Language** | TypeScript | Type safety, better DX |
| **UI Library** | Tailwind CSS + shadcn/ui | Beautiful components, customizable |
| **State Management** | React Query (TanStack Query) | Server state management, caching |
| **Forms** | React Hook Form + Zod | Type-safe validation |
| **Tables** | TanStack Table | Sorting, filtering, pagination |
| **Charts** | Recharts | Declarative, responsive charts |
| **Authentication** | NextAuth.js | Built for Next.js, OAuth support |

### Backend API

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Runtime** | Node.js 18+ | JavaScript ecosystem, async I/O |
| **Framework** | Express.js | Mature, flexible, extensive middleware |
| **Language** | TypeScript | Type safety, better maintainability |
| **Database** | PostgreSQL (Supabase) | Reliable, ACID compliant, JSON support |
| **ORM** | Prisma | Type-safe queries, migrations |
| **Authentication** | JWT | Stateless, scalable |
| **Validation** | Zod | Runtime type checking |
| **Logging** | Winston | Structured logging, multiple transports |
| **Queue** | Bull (Redis) | Scheduled tasks, job processing |
| **Cache** | Redis | Session storage, rate limiting |
| **File Storage** | Cloudinary | Image optimization, CDN |

### DevOps & Deployment

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Version Control** | Git + GitHub | Industry standard |
| **CI/CD** | GitHub Actions | Integrated, free for public repos |
| **API Hosting** | Railway | Easy deployment, PostgreSQL included |
| **Web Hosting** | Vercel | Optimized for Next.js |
| **Database** | Supabase | Managed PostgreSQL, free tier |
| **Monitoring** | Sentry | Error tracking, performance monitoring |
| **Analytics** | Plausible/Posthog | Privacy-friendly analytics |

---

## Database Design

### Entity Relationship Diagram (Conceptual)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    USER     │───────│     LOAN    │───────│  PAYMENT    │
│   (Driver)  │ 1:N   │             │ 1:N   │             │
└─────────────┘       └─────────────┘       └─────────────┘
      │ 1:N                   │ 1:N
      │                       │
      ▼                       ▼
┌─────────────┐       ┌─────────────┐
│KYC_DOCUMENT │       │ LOAN_SCHEDULE│
│             │       │             │
└─────────────┘       └─────────────┘
      │ 1:N
      │
      ▼
┌─────────────┐       ┌─────────────┐
│   VEHICLE   │───────│VEHICLE_RENTAL│
│             │ 1:N   │             │
└─────────────┘       └─────────────┘
```

### Key Tables

See `packages/database/schema.prisma` for complete schema.

**Core Entities:**
- `users` - Driver accounts
- `admins` - Admin accounts
- `kyc_documents` - Identity verification documents
- `loans` - Loan applications and active loans
- `loan_schedule` - Payment schedule for each loan
- `payments` - Payment transactions
- `vehicles` - Fleet inventory
- `vehicle_rentals` - Vehicle rental records
- `credit_score_history` - Credit score audit trail
- `notifications` - User notifications
- `settings` - System configuration
- `activity_logs` - Audit trail

### Indexing Strategy

**Critical Indexes:**
- `users.email`, `users.phone` - Login lookups
- `users.kycStatus` - KYC filtering
- `users.creditScore` - Eligibility queries
- `loans.userId`, `loans.status` - Loan queries
- `payments.userId`, `payments.loanId` - Payment history
- `loan_schedule.loanId`, `loan_schedule.dueDate` - Payment tracking

---

## API Design

### API Architecture Principles

1. **RESTful**: Standard HTTP methods (GET, POST, PUT, DELETE)
2. **Versioned**: `/api/v1/...` for future compatibility
3. **Consistent Responses**: Standard envelope format
4. **Error Handling**: Structured error messages
5. **Documentation**: OpenAPI/Swagger spec
6. **Rate Limiting**: Per-user and per-endpoint limits
7. **Pagination**: Cursor-based for large datasets

### Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_KYC_STATUS",
    "message": "KYC verification required",
    "details": {
      "kycStatus": "PENDING",
      "requiredStatus": "VERIFIED"
    }
  }
}
```

### Core API Modules

**Authentication** (`/api/v1/auth/`)
- POST `/register` - User registration
- POST `/login` - Login with email/phone
- POST `/refresh` - Refresh access token
- POST `/logout` - Logout
- POST `/verify-otp` - OTP verification
- POST `/forgot-password` - Password reset request
- POST `/reset-password` - Password reset confirmation

**Drivers** (`/api/v1/drivers/`)
- GET `/` - List drivers (admin only)
- GET `/me` - Get current driver profile
- GET `/:id` - Get driver by ID
- PUT `/:id` - Update driver profile
- POST `/:id/suspend` - Suspend driver
- POST `/:id/activate` - Activate driver

**KYC** (`/api/v1/kyc/`)
- GET `/documents` - Get user's KYC documents
- POST `/documents` - Upload KYC document
- GET `/documents/:id` - Get document details
- POST `/documents/:id/submit` - Submit document for review
- POST `/admin/documents/:id/approve` - Approve document (admin)
- POST `/admin/documents/:id/reject` - Reject document (admin)

**Loans** (`/api/v1/loans/`)
- GET `/` - List loans (paginated)
- GET `/eligibility` - Check loan eligibility
- POST `/apply` - Apply for loan
- GET `/:id` - Get loan details
- GET `/:id/schedule` - Get payment schedule
- POST `/admin/:id/approve` - Approve loan (admin)
- POST `/admin/:id/reject` - Reject loan (admin)
- POST `/admin/:id/disburse` - Disburse loan (admin)

**Credit Score** (`/api/v1/credit/`)
- GET `/score` - Get current credit score
- GET `/history` - Get score history
- GET `/factors` - Get score breakdown
- POST `/admin/:userId/recalculate` - Recalculate score (admin)

**Payments** (`/api/v1/payments/`)
- GET `/` - List payments (paginated)
- POST `/` - Initiate payment
- GET `/:id` - Get payment details
- POST `/:id/verify` - Verify payment status
- POST `/admin/manual` - Manual payment entry (admin)

**Vehicles** (`/api/v1/vehicles/`)
- GET `/` - List vehicles
- GET `/:id` - Get vehicle details
- POST `/` - Add vehicle (admin)
- PUT `/:id` - Update vehicle (admin)
- POST `/:id/rent` - Rent vehicle
- POST `/:id/return` - Return vehicle

**Reports** (`/api/v1/reports/`)
- GET `/dashboard` - Dashboard KPIs
- GET `/loans` - Loan performance report
- GET `/payments` - Payment collections report
- GET `/drivers` - Driver analytics report
- GET `/financial` - Financial summary report

---

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Server validates credentials
3. Server generates:
   - Access Token (JWT, 15min expiry)
   - Refresh Token (UUID, 7 days expiry, stored in Redis)
4. Client stores tokens securely:
   - Mobile: Encrypted secure storage
   - Web: HTTP-only cookies
5. Client includes access token in Authorization header
6. On token expiry, use refresh token to get new access token
```

### Authorization (RBAC)

**User Roles:**
- `USER` - Regular driver
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Driver/loan management
- `LOAN_OFFICER` - Loan approval only
- `FINANCE` - Payment management
- `SUPPORT` - View-only support

**Permission Matrix:**
| Resource | USER | SUPPORT | FINANCE | LOAN_OFFICER | ADMIN | SUPER_ADMIN |
|----------|------|---------|---------|--------------|-------|-------------|
| Own Profile | RW | - | - | - | R | RW |
| All Drivers | - | R | R | R | RW | RW |
| Loans | R (own) | R | R | RW | RW | RW |
| Payments | R (own) | R | RW | R | RW | RW |
| Settings | - | - | - | - | R | RW |
| Users | - | - | - | - | - | RW |

### Data Protection

1. **Passwords**: Bcrypt with 12 rounds
2. **Tokens**: JWT with RS256 (asymmetric encryption)
3. **PII**: Encrypted at rest (database-level encryption via Supabase)
4. **File Uploads**: Virus scanning, size limits, type validation
5. **API Keys**: Stored in environment variables, never in code
6. **HTTPS**: Enforced on all connections
7. **Rate Limiting**: Per-user and per-IP limits

### Audit Logging

All sensitive actions logged to `activity_logs`:
- User login/logout
- KYC approvals/rejections
- Loan approvals/rejections
- Payment processing
- Admin actions
- System configuration changes

---

## Scalability Strategy

### Horizontal Scaling

**API Servers:**
- Stateless design (JWT, no server-side sessions)
- Load balancing via Railway/Vercel
- Auto-scaling based on CPU/memory

**Database:**
- Read replicas for reporting queries
- Connection pooling (Prisma default: 10 connections)
- Query optimization with indexes

**Caching:**
- Redis for:
  - Session storage
  - Rate limiting
  - Frequently accessed data (credit scores, vehicle availability)
- Cache invalidation on data updates

### Performance Optimization

**API Response Times:**
- Target: < 500ms for 95% of requests
- Strategies:
  - Database query optimization
  - Eager loading for related data
  - Response compression (gzip)
  - Pagination for large datasets

**Mobile App:**
- Target: < 3s initial load, < 1s subsequent interactions
- Strategies:
  - Code splitting
  - Lazy loading
  - Image optimization (WebP, caching)
  - Skeleton screens instead of spinners
  - Optimistic UI updates

**Admin Portal:**
- Target: < 2s page load
- Strategies:
  - Static generation where possible
  - Server-side rendering for dynamic content
  - Prefetching on hover
  - Virtual scrolling for large tables

### Capacity Planning

**Current MVP Target:**
- 200 drivers
- 50 concurrent users
- 100 requests/minute

**6-Month Projection:**
- 2,000 drivers
- 500 concurrent users
- 1,000 requests/minute

**2-Year Projection:**
- 10,000 drivers
- 2,500 concurrent users
- 5,000 requests/minute

---

## Deployment Architecture

### Environments

1. **Development** (Local)
   - Local PostgreSQL
   - Local Redis (optional)
   - Mock external APIs

2. **Staging**
   - Railway (API)
   - Vercel (Admin Web)
   - Supabase (Database)
   - Real external APIs (test mode)

3. **Production**
   - Railway (API, auto-scaling)
   - Vercel (Admin Web, edge network)
   - Supabase (Database, backups)
   - Real external APIs (production mode)

### CI/CD Pipeline

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ GitHub Actions   │
│ - Lint           │
│ - Type Check     │
│ - Unit Tests     │
│ - Integration    │
└──────┬───────────┘
       │
       ▼ (on main branch)
┌──────────────────┐
│  Build & Deploy  │
│ - API → Railway  │
│ - Web → Vercel   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Post-Deploy      │
│ - Run migrations │
│ - Smoke tests    │
│ - Notifications  │
└──────────────────┘
```

### Monitoring & Alerting

**Metrics to Track:**
- API response times (p50, p95, p99)
- Error rates
- Database query performance
- Active users
- Payment success rate
- Credit score calculations
- KYC approval times

**Alerting Thresholds:**
- Error rate > 1%
- Response time p95 > 2s
- Database CPU > 80%
- Failed payments > 5%
- System downtime

**Tools:**
- Sentry: Error tracking
- Railway Metrics: Infrastructure monitoring
- Vercel Analytics: Web performance
- Custom dashboards: Business metrics

---

## Future Enhancements

### Phase 2 (Post-MVP)
- Real-time chat support
- In-app notifications (push + in-app)
- Advanced analytics dashboards
- ML-based credit scoring
- Automated collections

### Phase 3 (Expansion)
- Multi-country support (Senegal, Mali, Ghana, Nigeria)
- Multi-currency handling
- Multi-language (English, other local languages)
- Insurance integration
- Fleet owner portal

---

**Document Maintained By:** Omar (OpenClaw AI)  
**Last Review:** 2026-02-06  
**Next Review:** 2026-03-06
