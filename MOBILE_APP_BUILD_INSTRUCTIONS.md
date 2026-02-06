# 🚀 Driver Mobile App - Build Instructions for Claude Code

**Project:** DAM Africa V2 - Loan Management Platform  
**GitHub:** https://github.com/NAFFAGLOBAL/dam-africa-v2  
**Status:** Admin portal 85% done, Backend 100% done, Mobile app 0%

---

## 📍 YOU ARE HERE:

Building the **Driver Mobile App** (Flutter) for the loan management platform.

**Target users:** Drivers in Côte d'Ivoire  
**Primary language:** French  
**Purpose:** Apply for loans, submit KYC, make payments via mobile money

---

## 🎯 Your Mission:

Build a Flutter mobile app in the **`apps/driver-mobile/`** directory with these features:

### Phase 1 (Build This First):
1. ✅ Authentication (login, register, phone OTP)
2. ✅ Dashboard (credit score, active loans, next payment)
3. ✅ KYC submission (camera for ID, license, selfie, documents)
4. ✅ Loan application (eligibility check, apply, track status)
5. ✅ Payments (view schedule, make payment, history)
6. ✅ Profile (view/edit info, settings)

---

## 📋 Specifications:

**Read:** `apps/driver-mobile/README.md` (complete specs already written!)

**Key Points:**
- **Framework:** Flutter 3.x
- **State Management:** Riverpod (recommended)
- **API Base:** `https://api.damafrica.com` (or use `http://localhost:3000` for local testing)
- **Language:** French (Côte d'Ivoire)
- **Colors:** Primary #2563EB (blue), Success #10B981 (green)
- **Design:** Simple, driver-friendly UI

---

## 🏗️ Project Structure:

```
apps/driver-mobile/
├── README.md (specs - already exists)
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart (Dio setup)
│   │   │   └── endpoints.dart
│   │   ├── config/
│   │   │   └── app_config.dart
│   │   ├── router/
│   │   │   └── app_router.dart (go_router)
│   │   └── theme/
│   │       └── app_theme.dart (Material 3)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   └── otp_screen.dart
│   │   │   ├── providers/
│   │   │   │   └── auth_provider.dart (Riverpod)
│   │   │   └── models/
│   │   │       └── user.dart
│   │   ├── dashboard/
│   │   │   ├── screens/
│   │   │   │   └── dashboard_screen.dart
│   │   │   ├── widgets/
│   │   │   │   ├── credit_score_card.dart
│   │   │   │   ├── active_loan_card.dart
│   │   │   │   └── next_payment_card.dart
│   │   │   └── providers/
│   │   │       └── dashboard_provider.dart
│   │   ├── kyc/
│   │   │   ├── screens/
│   │   │   │   ├── kyc_home_screen.dart
│   │   │   │   ├── document_capture_screen.dart
│   │   │   │   └── kyc_status_screen.dart
│   │   │   └── providers/
│   │   │       └── kyc_provider.dart
│   │   ├── loans/
│   │   │   ├── screens/
│   │   │   │   ├── loan_eligibility_screen.dart
│   │   │   │   ├── loan_calculator_screen.dart
│   │   │   │   ├── loan_application_screen.dart
│   │   │   │   └── loan_details_screen.dart
│   │   │   └── providers/
│   │   │       └── loan_provider.dart
│   │   ├── payments/
│   │   │   ├── screens/
│   │   │   │   ├── payment_schedule_screen.dart
│   │   │   │   ├── make_payment_screen.dart
│   │   │   │   └── payment_history_screen.dart
│   │   │   └── providers/
│   │   │       └── payment_provider.dart
│   │   └── profile/
│   │       ├── screens/
│   │       │   ├── profile_screen.dart
│   │       │   ├── edit_profile_screen.dart
│   │       │   └── settings_screen.dart
│   │       └── providers/
│   │           └── profile_provider.dart
│   └── shared/
│       ├── models/
│       │   ├── loan.dart
│       │   ├── payment.dart
│       │   ├── kyc_document.dart
│       │   └── credit_score.dart
│       ├── widgets/
│       │   ├── custom_button.dart
│       │   ├── custom_text_field.dart
│       │   ├── loading_indicator.dart
│       │   └── error_widget.dart
│       └── utils/
│           ├── formatters.dart
│           └── validators.dart
├── pubspec.yaml
├── android/
├── ios/
└── test/
```

---

## 🔌 API Integration:

**Backend is already running!** Use these endpoints:

### Authentication
```
POST /api/v1/auth/register
Body: { phone, password, fullName, email }

POST /api/v1/auth/login  
Body: { phone, password }
Response: { token, user }

GET /api/v1/users/me
Headers: Authorization: Bearer {token}
```

### KYC
```
POST /api/v1/kyc/documents
Headers: Authorization: Bearer {token}, Content-Type: multipart/form-data
Body: file (FormData)

GET /api/v1/kyc/status
```

### Loans
```
GET /api/v1/loans/eligibility

POST /api/v1/loans
Body: { amount, purpose, vehicleId, termMonths }

GET /api/v1/loans (user's loans)
GET /api/v1/loans/:id
```

### Payments
```
GET /api/v1/payments (payment history)
GET /api/v1/payments/schedule/:loanId

POST /api/v1/payments
Body: { loanId, amount, provider: "WAVE" | "ORANGE_MONEY" }
```

---

## 📱 Key Features to Implement:

### 1. Authentication Flow
```dart
// Login screen with phone + password
// Store JWT token in FlutterSecureStorage
// Biometric auth (local_auth plugin)
// Auto-login on app launch if token valid
```

### 2. Dashboard (Home Screen)
```dart
// Credit score display (circular progress, 0-1000)
// Active loan card (amount, next payment, days until due)
// Next payment reminder card
// Quick actions: Apply for loan, Make payment, Submit KYC
// Bottom navigation: Home, Loans, Payments, Profile
```

### 3. KYC Submission
```dart
// Camera integration (camera plugin)
// Capture ID card (front/back)
// Capture driver license
// Capture selfie
// Upload documents (multipart/form-data)
// Show KYC status (pending/approved/rejected)
```

### 4. Loan Application
```dart
// Check eligibility (GET /api/v1/loans/eligibility)
// Loan calculator (amount slider, term selector, show monthly payment)
// Application form (amount, purpose, vehicle)
// Submit application
// Track status (pending/approved/disbursed)
```

### 5. Payments
```dart
// Payment schedule list (date, amount, status)
// Make payment screen:
//   - Select provider (Wave, Orange Money)
//   - Enter amount
//   - Confirm payment
// Payment history (successful/failed/pending)
// Receipt generation
```

---

## 🎨 UI/UX Guidelines:

### Design Principles:
- **Simple:** Drivers need easy-to-understand UI
- **French:** All text in French (Côte d'Ivoire)
- **Clear CTAs:** Big buttons, obvious actions
- **Visual Feedback:** Loading states, success/error messages
- **Offline-aware:** Show cached data when offline

### Colors:
```dart
primaryColor: Color(0xFF2563EB),      // Blue
successColor: Color(0xFF10B981),      // Green
warningColor: Color(0xFFF59E0B),      // Orange
errorColor: Color(0xFFEF4444),        // Red
backgroundColor: Color(0xFFF9FAFB),   // Gray 50
```

### Typography:
```dart
headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.normal),
bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.normal),
```

---

## 🚀 Build Steps:

### Step 1: Initialize Flutter Project
```bash
cd apps/driver-mobile
flutter create . --org com.damafrica --platforms android,ios
```

### Step 2: Add Dependencies
```bash
flutter pub add riverpod flutter_riverpod
flutter pub add dio
flutter pub add go_router
flutter pub add flutter_secure_storage
flutter pub add shared_preferences
flutter pub add camera
flutter pub add image_picker
flutter pub add local_auth
flutter pub add intl
flutter pub add flutter_svg
flutter pub add --dev flutter_lints
```

### Step 3: Create Project Structure
```bash
# Create folders as shown in structure above
mkdir -p lib/{core/{api,config,router,theme},features/{auth,dashboard,kyc,loans,payments,profile}/{screens,providers,widgets,models},shared/{models,widgets,utils}}
```

### Step 4: Implement Features (In Order)
1. API client setup (Dio)
2. App router (go_router)
3. Theme configuration
4. Auth screens (login, register)
5. Auth provider (Riverpod)
6. Dashboard screen
7. KYC screens
8. Loan screens
9. Payment screens
10. Profile screens

### Step 5: Test
```bash
# Run on Android emulator
flutter run -d android

# Run on iOS simulator
flutter run -d ios

# Run tests
flutter test
```

### Step 6: Build Release
```bash
# Android APK
flutter build apk --release

# iOS IPA
flutter build ios --release
```

---

## ✅ Success Criteria:

**Phase 1 is complete when:**
- [ ] Can register new user (phone, password, name)
- [ ] Can login and see dashboard
- [ ] Dashboard shows credit score (mock or real)
- [ ] Can navigate to KYC and upload documents
- [ ] Can check loan eligibility
- [ ] Can apply for a loan
- [ ] Can view payment schedule
- [ ] Can initiate payment
- [ ] All screens in French
- [ ] No errors, runs smoothly
- [ ] Works on iOS and Android

---

## 📝 French UI Text Examples:

```dart
// Login
"Connexion" // Login
"Numéro de téléphone" // Phone number
"Mot de passe" // Password
"Se connecter" // Sign in
"Pas de compte? S'inscrire" // No account? Register

// Dashboard
"Tableau de bord" // Dashboard
"Score de crédit" // Credit score
"Prêt actif" // Active loan
"Prochain paiement" // Next payment
"Faire une demande" // Apply for loan

// KYC
"Vérification d'identité" // Identity verification
"Carte d'identité" // ID card
"Permis de conduire" // Driver license
"Selfie" // Selfie
"Soumettre" // Submit

// Loans
"Demande de prêt" // Loan application
"Vérifier l'éligibilité" // Check eligibility
"Montant du prêt" // Loan amount
"Durée" // Term
"Objectif" // Purpose

// Payments
"Paiements" // Payments
"Échéancier" // Schedule
"Faire un paiement" // Make payment
"Historique" // History
```

---

## 🆘 If You Get Stuck:

**Check these:**
- `apps/driver-mobile/README.md` - Full specs
- `apps/api/` - Backend code (see how API works)
- `apps/admin-web/` - Admin portal (see UI patterns)

**Common issues:**
- Camera permissions? Add to AndroidManifest.xml and Info.plist
- API not responding? Make sure backend is running: `npm run dev:api`
- Token errors? Check Authorization header format: `Bearer {token}`

---

## 🔗 Backend Connection:

**Local development:**
```dart
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

**Production:**
```dart
const API_BASE_URL = 'https://api.damafrica.com/api/v1';
```

---

## 🎯 Priority Order:

**Build in this sequence:**
1. Authentication (login/register) - MUST HAVE
2. Dashboard (home screen) - MUST HAVE
3. KYC submission - MUST HAVE
4. Loan application - MUST HAVE
5. Payments - MUST HAVE
6. Profile - NICE TO HAVE

**Timeline:** 1-2 days for Phase 1 (MVP)

---

## 📦 Deliverables:

When complete, the `apps/driver-mobile/` folder should contain:
- ✅ Working Flutter project
- ✅ All screens implemented
- ✅ API integration working
- ✅ French language throughout
- ✅ Can build APK and IPA
- ✅ README with build instructions
- ✅ Tests (at least smoke tests)

---

**This is the CORRECT project! Build this Flutter app!** 🚀

---

## 🔔 When Complete:

```bash
cd apps/driver-mobile
git add .
git commit -m "feat: driver mobile app (Flutter) - Phase 1 complete"
git push origin main

# Notify
openclaw gateway wake --text "Driver mobile app complete! Ready for testing on iOS/Android." --mode now
```

---

**Let's build an app that drivers will love!** 📱✨
