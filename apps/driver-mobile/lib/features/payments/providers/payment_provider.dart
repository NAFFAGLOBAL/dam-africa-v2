import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_service.dart';
import '../../../models/payment.dart';

final paymentHistoryProvider =
    FutureProvider.autoDispose<List<Payment>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  return api.getPaymentHistory();
});

class PaymentCreateState {
  final bool isLoading;
  final Payment? result;
  final String? error;

  const PaymentCreateState({
    this.isLoading = false,
    this.result,
    this.error,
  });
}

class PaymentCreateNotifier extends StateNotifier<PaymentCreateState> {
  final ApiService _api;

  PaymentCreateNotifier(this._api) : super(const PaymentCreateState());

  Future<bool> createPayment({
    String? loanId,
    required double amount,
    required String method,
    String? phone,
    String? description,
  }) async {
    state = const PaymentCreateState(isLoading: true);
    try {
      final payment = await _api.createPayment(
        loanId: loanId,
        amount: amount,
        method: method,
        phone: phone,
        description: description,
      );
      state = PaymentCreateState(result: payment);
      return true;
    } on ApiException catch (e) {
      state = PaymentCreateState(error: e.message);
      return false;
    } catch (_) {
      state = const PaymentCreateState(error: 'Une erreur est survenue');
      return false;
    }
  }
}

final paymentCreateProvider =
    StateNotifierProvider.autoDispose<PaymentCreateNotifier, PaymentCreateState>(
        (ref) {
  return PaymentCreateNotifier(ref.watch(apiServiceProvider));
});
