# DAMFlotte CLD - Driver Mobile App

Flutter mobile application for drivers in Côte d'Ivoire.

## Tech Stack
- Flutter 3.x (SDK >=3.2.0)
- Riverpod for state management
- Dio for HTTP client
- Go Router for navigation
- Flutter Secure Storage for token management

## Getting Started

```bash
# Install dependencies
flutter pub get

# Run on connected device/emulator
flutter run

# Build for Android
flutter build apk --release

# Build for iOS
flutter build ios --release
```

## Configuration

Update the API base URL in `lib/core/config/app_config.dart`:

```dart
static const String apiBaseUrl = 'http://your-api-url/api/v1';
```

## Features

- **Authentication** - Login, registration with JWT token management and auto-refresh
- **Dashboard** - Overview with KYC status, credit score, active loans, recent payments
- **KYC Verification** - Document upload (ID, license, proof of address, selfie) with status tracking
- **Loan Management** - Eligibility check, loan application, payment schedule, progress tracking
- **Payments** - Wave, Mobile Money, bank transfer support with payment history
- **Profile** - Profile management, password change, verification status

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── core/
│   ├── api/                     # API client, auth interceptor, token storage
│   ├── config/                  # App configuration
│   ├── router/                  # GoRouter setup with auth guards
│   ├── theme/                   # Material 3 theme, colors
│   ├── utils/                   # Formatters, validators
│   └── widgets/                 # Shared widgets (shell, status badge, loading)
├── features/
│   ├── auth/                    # Login, register screens & auth state
│   ├── dashboard/               # Home screen with overview cards
│   ├── kyc/                     # KYC document upload & status
│   ├── loans/                   # Loan list, apply, detail, schedule
│   ├── payments/                # Payment history, create payment
│   └── profile/                 # Profile view, edit, password change
└── models/                      # Data models (user, loan, payment, etc.)
```

## Localization

All driver-facing content is in French (Côte d'Ivoire).
Currency: FCFA (XOF).
Phone format: +225 XX XX XX XX XX.
