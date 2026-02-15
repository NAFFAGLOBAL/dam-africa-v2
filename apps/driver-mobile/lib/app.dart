import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/routes.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/credit_provider.dart';
import 'providers/loan_provider.dart';
import 'providers/payment_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/credit/credit_score_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/loan/loan_apply_screen.dart';
import 'screens/loan/loan_detail_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/onboarding/kyc_screen.dart';
import 'screens/payment/make_payment_screen.dart';
import 'screens/splash_screen.dart';

class DriverMobileApp extends StatelessWidget {
  const DriverMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CreditProvider()),
        ChangeNotifierProvider(create: (_) => LoanProvider()),
        ChangeNotifierProvider(create: (_) => PaymentProvider()),
      ],
      child: MaterialApp(
        title: 'DAM Africa',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: Routes.splash,
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case Routes.splash:
              return MaterialPageRoute(
                builder: (_) => const SplashScreen(),
              );
            case Routes.login:
              return MaterialPageRoute(
                builder: (_) => const LoginScreen(),
              );
            case Routes.register:
              return MaterialPageRoute(
                builder: (_) => const RegisterScreen(),
              );
            case Routes.kyc:
              return MaterialPageRoute(
                builder: (_) => const KYCScreen(),
              );
            case Routes.home:
              return MaterialPageRoute(
                builder: (_) => const HomeScreen(),
              );
            case Routes.creditScore:
              return MaterialPageRoute(
                builder: (_) => const CreditScoreScreen(),
              );
            case Routes.loanApply:
              return MaterialPageRoute(
                builder: (_) => const LoanApplyScreen(),
              );
            case Routes.loanDetail:
              final loanId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (_) => LoanDetailScreen(loanId: loanId),
              );
            case Routes.makePayment:
              final loanId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (_) => MakePaymentScreen(loanId: loanId),
              );
            case Routes.notifications:
              return MaterialPageRoute(
                builder: (_) => const NotificationsScreen(),
              );
            default:
              return MaterialPageRoute(
                builder: (_) => const SplashScreen(),
              );
          }
        },
      ),
    );
  }
}
