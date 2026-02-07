# DAM Africa - Driver Mobile App

Flutter mobile application for drivers to manage their profile, submit KYC, apply for loans, and make payments.

## Features (MVP)

### Phase 1: Authentication & Onboarding ✅
- ✅ Splash screen with branding
- ✅ Login / Register screens
- ✅ Phone verification (OTP)
- ✅ Biometric authentication
- ✅ Onboarding flow

### Phase 2: KYC Submission 🚧 In Progress
- Camera integration for document capture
- Gallery selection
- ID card (front/back)
- Driver license
- Selfie
- Proof of address
- KYC status tracking

### Phase 3: Dashboard
- Credit score display
- Active loans overview
- Next payment due
- Quick actions
- Notifications

### Phase 4: Loan Application
- Check eligibility
- Loan calculator
- Application form
- Purpose selection
- Vehicle selection
- Application tracking

### Phase 5: Payments
- View payment schedule
- Make payment (Mobile Money / Bank)
- Payment history
- Payment receipts
- Overdue alerts

### Phase 6: Profile & Settings
- View/edit profile
- View KYC documents
- Loan history
- Settings
- Support

## Tech Stack

- **Framework:** Flutter 3.x
- **State Management:** Provider / Riverpod
- **API Client:** Dio
- **Local Storage:** Shared Preferences / Hive
- **Navigation:** Go Router
- **Camera:** camera plugin
- **Biometrics:** local_auth
- **Push Notifications:** Firebase Cloud Messaging

## Getting Started

```bash
# Install dependencies
flutter pub get

# Run on iOS simulator
flutter run -d ios

# Run on Android emulator
flutter run -d android

# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

## Project Structure

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── api/           # API client
│   ├── config/        # App configuration
│   ├── constants/     # Constants
│   ├── router/        # Navigation
│   └── theme/         # App theme
├── features/
│   ├── auth/          # Authentication
│   ├── onboarding/    # Onboarding
│   ├── dashboard/     # Home dashboard
│   ├── kyc/           # KYC submission
│   ├── loans/         # Loan application
│   ├── payments/      # Payments
│   └── profile/       # User profile
├── shared/
│   ├── models/        # Data models
│   ├── widgets/       # Reusable widgets
│   └── utils/         # Utilities
└── l10n/              # Localization (French)
```

## API Integration

**Base URL:** `https://api.damafrica.com` (or configured endpoint)

**Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/users/me` - Get current user
- `POST /api/v1/kyc/documents` - Submit KYC document
- `GET /api/v1/loans/eligibility` - Check loan eligibility
- `POST /api/v1/loans` - Apply for loan
- `POST /api/v1/payments` - Make payment

## Design System

**Colors:**
- Primary: #2563EB (Blue)
- Success: #10B981 (Green)
- Warning: #F59E0B (Orange)
- Error: #EF4444 (Red)
- Background: #F9FAFB (Gray 50)

**Typography:**
- Font Family: Inter / SF Pro (system default)
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Captions: Regular, 12px

## Localization

Primary language: **French (Côte d'Ivoire)**

All UI text must be in French for the target market.

## Security

- ✅ JWT token storage (secure storage)
- ✅ Biometric authentication
- ✅ Secure API communication (HTTPS)
- ✅ Certificate pinning
- ✅ No sensitive data in logs

## Testing

```bash
# Run unit tests
flutter test

# Run widget tests
flutter test test/widget_test.dart

# Run integration tests
flutter test integration_test/
```

## Deployment

### Android
- Target SDK: 33+
- Min SDK: 21 (Android 5.0)
- Build: AAB for Play Store

### iOS
- Target: iOS 13.0+
- Build: IPA for App Store

## Status

**Current Progress:** 0% (Setup phase)  
**Next Steps:**
1. Initialize Flutter project
2. Set up project structure
3. Configure API client
4. Build authentication screens
5. Implement KYC flow

## Notes

- Focus on **Côte d'Ivoire market** (French language, local payment methods)
- **Mobile Money** is the primary payment method
- **Simple, clear UI** - drivers need easy-to-use interface
- **Offline support** for viewing data (nice to have)
- **Push notifications** for payment reminders

---

**Building the App of 2026!** 🚀
