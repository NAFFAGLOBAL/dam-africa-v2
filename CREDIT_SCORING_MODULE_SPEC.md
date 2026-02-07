# Credit Scoring Module - Complete Specification

**Priority:** CRITICAL (Missing core feature!)  
**Build Time:** 2-3 hours  
**Status:** Backend ✅ Done | Frontend ❌ Not built

---

## 🎯 Overview:

Build a comprehensive credit scoring interface in the admin portal that shows:
1. List of all driver credit scores (filterable, searchable)
2. Detailed breakdown of individual credit scores
3. Score history and trends
4. Manual recalculation functionality

---

## 📊 Credit Scoring Formula (Backend - Already Built):

```
Total Score = (
  Payment History (35%) +
  Loan Utilization (30%) +
  Account Age (15%) +
  Driving Performance (10%) +
  KYC Completeness (10%)
) × 100

Rating Scale:
A: 800-1000 → Max 2M CFA @ 12% interest
B: 650-799  → Max 1.5M CFA @ 15% interest
C: 500-649  → Max 1M CFA @ 18% interest
D: 350-499  → Max 500K CFA @ 24% interest
E: 0-349    → Not eligible
```

---

## 📋 Page 1: Credit Scores List (`/credit`)

### Layout:

```
┌──────────────────────────────────────────────────────┐
│ Scores de Crédit                          🔍 Recherche│
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │ Note A │ │ Note B │ │ Note C │ │ Note D+E│       │
│ │   45   │ │   78   │ │   34   │ │   12   │       │
│ └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                      │
│ Filtres: [Toutes ▼] [A] [B] [C] [D] [E]           │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Mamadou Diallo                                 │ │
│ │ Score: 850 | Note: A                          │ │
│ │ Montant max: 2M CFA | Taux: 12%              │ │
│ │ Dernière mise à jour: Il y a 2 jours         │ │
│ │ [Voir détails →]                              │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Kofi Mensah                                    │ │
│ │ Score: 720 | Note: B                          │ │
│ │ Montant max: 1.5M CFA | Taux: 15%            │ │
│ │ Dernière mise à jour: Il y a 1 jour           │ │
│ │ [Voir détails →]                              │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Pagination: < 1 2 3 ... 10 >                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Features:

**Stats Cards (Top):**
- Count of drivers in each rating (A, B, C, D+E)
- Color-coded badges

**Filters:**
- Filter by rating: All, A, B, C, D, E
- Search by driver name
- Sort by: Score (high/low), Last updated

**Driver Cards:**
- Driver name (clickable → driver profile)
- Current score and rating
- Max loan amount for rating
- Interest rate for rating
- Last score update time
- "View Details" button → credit detail page

**Pagination:**
- 20 drivers per page

---

## 📋 Page 2: Credit Score Detail (`/credit/[userId]`)

### Layout:

```
┌──────────────────────────────────────────────────────┐
│ ← Retour | Score de Crédit - Mamadou Diallo         │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │  SCORE TOTAL                                   │ │
│ │  ┌────────────────┐                            │ │
│ │  │      850       │  Note: A                   │ │
│ │  │     /1000      │                            │ │
│ │  └────────────────┘                            │ │
│ │  Montant max: 2,000,000 CFA                   │ │
│ │  Taux d'intérêt: 12% par an                   │ │
│ │  [Recalculer le score]                         │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │  DÉTAIL DES COMPOSANTES                        │ │
│ │                                                │ │
│ │  Historique de paiement (35%)                 │ │
│ │  ████████░░ 800/1000                          │ │
│ │  • Paiements à temps: 95%                     │ │
│ │  • Paiements en retard: 5%                    │ │
│ │  • Paiements manqués: 0%                      │ │
│ │                                                │ │
│ │  Utilisation du crédit (30%)                  │ │
│ │  ██████░░░░ 600/1000                          │ │
│ │  • Prêts actifs: 1                            │ │
│ │  • Utilisation: 45%                           │ │
│ │                                                │ │
│ │  Ancienneté du compte (15%)                   │ │
│ │  ████████░░ 800/1000                          │ │
│ │  • Âge du compte: 18 mois                     │ │
│ │                                                │ │
│ │  Performance de conduite (10%)                │ │
│ │  █████░░░░░ 500/1000                          │ │
│ │  • À venir: intégration Yango/Uffizio        │ │
│ │                                                │ │
│ │  Complétude KYC (10%)                         │ │
│ │  ██████████ 1000/1000                         │ │
│ │  • Tous les documents approuvés              │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │  HISTORIQUE DU SCORE                           │ │
│ │                                                │ │
│ │  [Line Chart: Score over time]                │ │
│ │  850 ─────────────────────●                   │ │
│ │  800         ●───●──●                         │ │
│ │  750     ●──○                                  │ │
│ │  700 ───○                                      │ │
│ │      Jan  Feb Mar Apr Mai                     │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │  CHANGEMENTS RÉCENTS                           │ │
│ │                                                │ │
│ │  06/02/2026 | 850 (+50) | Paiement à temps   │ │
│ │  15/01/2026 | 800 (+20) | KYC approuvé       │ │
│ │  01/01/2026 | 780 (+0)  | Recalcul automatique│ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ [Voir le profil du conducteur]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Features:

**1. Score Display (Top Section):**
- Large score number (e.g., 850/1000)
- Rating badge (A, B, C, D, E) - color coded
- Max loan amount for rating
- Interest rate for rating
- "Recalculate Score" button (triggers API)

**2. Component Breakdown (Middle Section):**
Each of 5 components shows:
- Component name and weight (e.g., "Payment History (35%)")
- Visual progress bar (colored based on score)
- Individual score (e.g., 800/1000)
- Detailed metrics:
  - Payment History: % on time, late, missed
  - Loan Utilization: # active loans, % utilization
  - Account Age: months since registration
  - Driving Performance: Integration status or mock
  - KYC Completeness: documents approved

**3. Score History Chart (Bottom Section):**
- Line chart showing score over last 12 months
- X-axis: Months
- Y-axis: Score (0-1000)
- Data points clickable to show reason for change

**4. Recent Changes Table:**
- Date of change
- New score (with +/- change)
- Reason for change (e.g., "Payment on time", "KYC approved")
- Last 10 changes

**5. Actions:**
- "Recalculate Score" button
- "View Driver Profile" link
- Back to credit list

---

## 🔌 API Integration:

### Endpoints to Use:

```typescript
// Get user credit score with breakdown
GET /api/v1/credit/admin/:userId
Authorization: Bearer {admin_token}

Response:
{
  "score": 850,
  "rating": "A",
  "breakdown": {
    "paymentHistory": 800,
    "loanUtilization": 600,
    "accountAge": 800,
    "drivingPerformance": 500,
    "kycCompleteness": 1000
  }
}

// Get credit score history
GET /api/v1/credit/history?userId={userId}
Authorization: Bearer {admin_token}

Response:
{
  "history": [
    {
      "id": "uuid",
      "score": 850,
      "rating": "A",
      "changeReason": "Payment on time",
      "createdAt": "2026-02-06T10:00:00Z"
    },
    // ... more history
  ]
}

// Recalculate credit score
POST /api/v1/credit/admin/:userId/recalculate
Authorization: Bearer {admin_token}
Body: { "reason": "Manual recalculation by admin" }

Response:
{
  "score": 850,
  "rating": "A",
  "previousScore": 800,
  "previousRating": "B",
  "change": +50
}

// Get all users with scores (for list page)
GET /api/v1/users?include=creditScore&limit=20&offset=0
Authorization: Bearer {admin_token}
```

---

## 🎨 UI Components to Build:

### 1. CreditScoreCard Component
```typescript
// Used in list page
<CreditScoreCard
  user={user}
  score={850}
  rating="A"
  maxLoanAmount={2000000}
  interestRate={12}
  lastUpdated="2 days ago"
  onClick={() => router.push(`/credit/${user.id}`)}
/>
```

### 2. ScoreBreakdownBar Component
```typescript
// Progress bar with label
<ScoreBreakdownBar
  label="Payment History (35%)"
  score={800}
  maxScore={1000}
  details={[
    "On-time payments: 95%",
    "Late payments: 5%",
    "Missed payments: 0%"
  ]}
/>
```

### 3. ScoreHistoryChart Component
```typescript
// Line chart using recharts
<ScoreHistoryChart
  data={history}
  height={300}
/>
```

### 4. ScoreChangeTable Component
```typescript
// Recent changes table
<ScoreChangeTable
  changes={recentChanges}
  limit={10}
/>
```

### 5. RecalculateButton Component
```typescript
// Button with loading state + confirmation
<RecalculateButton
  userId={userId}
  onRecalculate={(newScore) => {
    // Show success message
    // Refresh data
  }}
/>
```

---

## 📁 File Structure:

```
apps/admin-web/src/app/
├── credit/
│   ├── page.tsx (Credit scores list)
│   ├── [userId]/
│   │   └── page.tsx (Credit score detail)
│   └── components/
│       ├── CreditScoreCard.tsx
│       ├── ScoreBreakdownBar.tsx
│       ├── ScoreHistoryChart.tsx
│       ├── ScoreChangeTable.tsx
│       └── RecalculateButton.tsx
```

---

## 🎨 Color Scheme for Ratings:

```typescript
const RATING_COLORS = {
  A: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    badge: 'bg-green-500'
  },
  B: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    badge: 'bg-blue-500'
  },
  C: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    badge: 'bg-yellow-500'
  },
  D: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    badge: 'bg-orange-500'
  },
  E: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    badge: 'bg-red-500'
  }
};
```

---

## ✅ Acceptance Criteria:

**Credit List Page:**
- [ ] Shows all drivers with credit scores
- [ ] Can filter by rating (A-E)
- [ ] Can search by name
- [ ] Can sort by score
- [ ] Shows stats cards at top
- [ ] Pagination works
- [ ] Click driver → goes to detail page

**Credit Detail Page:**
- [ ] Shows large score display with rating
- [ ] Shows max loan amount and interest rate
- [ ] Shows 5-component breakdown with bars
- [ ] Shows detailed metrics for each component
- [ ] Shows score history chart (last 12 months)
- [ ] Shows recent changes table (last 10)
- [ ] Recalculate button works (with confirmation)
- [ ] Link to driver profile works
- [ ] Loading states for all API calls
- [ ] Error handling for failed requests

**General:**
- [ ] French UI text throughout
- [ ] Responsive design (desktop + tablet)
- [ ] Consistent with existing admin portal style
- [ ] No console errors
- [ ] Proper authentication checks

---

## 🔧 Dependencies to Add:

```bash
cd apps/admin-web
npm install recharts
npm install date-fns
```

---

## ⏱️ Build Estimate:

**Credit List Page:** 45 minutes
- Layout and stat cards (15 min)
- Driver cards with filters (20 min)
- API integration (10 min)

**Credit Detail Page:** 90 minutes
- Score display section (15 min)
- Component breakdown bars (30 min)
- History chart (20 min)
- Recent changes table (15 min)
- Recalculate functionality (10 min)

**Components & Polish:** 30 minutes
- Reusable components (15 min)
- Error handling (10 min)
- Loading states (5 min)

**Total: 2.5-3 hours**

---

## 🚀 After This Build:

**Admins will be able to:**
- ✅ View all driver credit scores in one place
- ✅ See detailed breakdown of why someone has a certain score
- ✅ Understand which component needs improvement
- ✅ Track score changes over time
- ✅ Manually trigger recalculations when needed
- ✅ Explain to stakeholders why loans are approved/rejected

**This completes the credit scoring feature!**

---

**Ready to build this now?** 🚀
