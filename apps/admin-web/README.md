# DAM Africa - Admin Web Portal

Next.js 14 admin portal for managing drivers, loans, KYC, and payments.

## Features

- ✅ Admin authentication
- ✅ Dashboard with KPIs
- 🚧 Driver management (Phase 2)
- 🚧 KYC review interface (Phase 2)
- 🚧 Loan approval workflow (Phase 2)
- 🚧 Payment tracking (Phase 2)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** React Query + Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Tables:** TanStack Table

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variable
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
```

Open http://localhost:3000

## Test Credentials

```
Email: admin@damafrica.com
Password: Admin@123
```

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard
NEXT_PUBLIC_API_URL=<your-production-api-url>
```

## Project Structure

```
src/
├── app/
│   ├── login/          # Login page
│   ├── dashboard/      # Main dashboard
│   └── globals.css     # Global styles
└── (future)
    ├── components/     # Reusable components
    ├── lib/            # API client, utils
    └── hooks/          # Custom hooks
```

## Next Steps

1. Test login with admin credentials
2. Verify dashboard loads stats from API
3. Build additional pages (drivers, KYC, loans, payments)
4. Add navigation sidebar
5. Implement full CRUD operations

## Status

**Phase 1:** Basic setup complete ✅  
**Phase 2:** Full admin features (in progress)
