import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_service.dart';
import '../../../models/loan.dart';

// Fetch all user loans
final myLoansProvider = FutureProvider.autoDispose<List<Loan>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  return api.getMyLoans();
});

// Fetch loan eligibility
final loanEligibilityProvider =
    FutureProvider.autoDispose<LoanEligibility>((ref) async {
  final api = ref.watch(apiServiceProvider);
  return api.checkLoanEligibility();
});

// Fetch single loan details
final loanDetailProvider =
    FutureProvider.autoDispose.family<Loan, String>((ref, loanId) async {
  final api = ref.watch(apiServiceProvider);
  return api.getLoanDetails(loanId);
});

// Fetch loan schedule
final loanScheduleProvider =
    FutureProvider.autoDispose.family<List<LoanSchedule>, String>((ref, loanId) async {
  final api = ref.watch(apiServiceProvider);
  return api.getLoanSchedule(loanId);
});

// Loan application state
class LoanApplicationState {
  final bool isLoading;
  final Loan? result;
  final String? error;

  const LoanApplicationState({
    this.isLoading = false,
    this.result,
    this.error,
  });
}

class LoanApplicationNotifier extends StateNotifier<LoanApplicationState> {
  final ApiService _api;

  LoanApplicationNotifier(this._api) : super(const LoanApplicationState());

  Future<bool> apply({
    required double amount,
    required int termMonths,
    String? purpose,
  }) async {
    state = const LoanApplicationState(isLoading: true);
    try {
      final loan = await _api.applyForLoan(
        amount: amount,
        termMonths: termMonths,
        purpose: purpose,
      );
      state = LoanApplicationState(result: loan);
      return true;
    } on ApiException catch (e) {
      state = LoanApplicationState(error: e.message);
      return false;
    } catch (_) {
      state = const LoanApplicationState(
        error: 'Une erreur est survenue',
      );
      return false;
    }
  }

  void reset() {
    state = const LoanApplicationState();
  }
}

final loanApplicationProvider =
    StateNotifierProvider.autoDispose<LoanApplicationNotifier, LoanApplicationState>(
        (ref) {
  return LoanApplicationNotifier(ref.watch(apiServiceProvider));
});
