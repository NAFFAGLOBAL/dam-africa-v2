import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/kyc/screens/kyc_screen.dart';
import '../../features/kyc/screens/kyc_upload_screen.dart';
import '../../features/loans/screens/loan_apply_screen.dart';
import '../../features/loans/screens/loan_detail_screen.dart';
import '../../features/loans/screens/loans_screen.dart';
import '../../features/payments/screens/payment_create_screen.dart';
import '../../features/payments/screens/payments_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';
import '../../features/profile/screens/change_password_screen.dart';
import '../widgets/app_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/dashboard',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';
      final isInitial = authState.status == AuthStatus.initial;

      if (isInitial) return null;

      if (!isAuth && !isAuthRoute) return '/login';
      if (isAuth && isAuthRoute) return '/dashboard';

      return null;
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // Main app shell with bottom nav
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: DashboardScreen(),
            ),
          ),
          GoRoute(
            path: '/loans',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: LoansScreen(),
            ),
          ),
          GoRoute(
            path: '/payments',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: PaymentsScreen(),
            ),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),

      // Detail routes (outside shell)
      GoRoute(
        path: '/kyc',
        builder: (context, state) => const KycScreen(),
      ),
      GoRoute(
        path: '/kyc/upload',
        builder: (context, state) => const KycUploadScreen(),
      ),
      GoRoute(
        path: '/loans/apply',
        builder: (context, state) => const LoanApplyScreen(),
      ),
      GoRoute(
        path: '/loans/:id',
        builder: (context, state) => LoanDetailScreen(
          loanId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/payments/create',
        builder: (context, state) {
          final loanId = state.uri.queryParameters['loanId'];
          return PaymentCreateScreen(loanId: loanId);
        },
      ),
      GoRoute(
        path: '/profile/edit',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/profile/password',
        builder: (context, state) => const ChangePasswordScreen(),
      ),
    ],
  );
});
