import 'package:flutter/foundation.dart';
import '../config/api_config.dart';
import '../models/payment.dart';
import '../services/api_service.dart';

class PaymentProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  List<Payment> _payments = [];
  bool _isLoading = false;
  String? _error;

  List<Payment> get payments => _payments;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchPayments() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.payments);
      final data = response.data as List<dynamic>;
      _payments = data
          .map((json) => Payment.fromJson(json as Map<String, dynamic>))
          .toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Erreur lors du chargement des paiements';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> makePayment({
    required String loanId,
    required double amount,
    required String method,
    String? reference,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _api.post(
        ApiConfig.payments,
        data: {
          'loanId': loanId,
          'amount': amount,
          'method': method,
          if (reference != null) 'reference': reference,
        },
      );
      _isLoading = false;
      notifyListeners();
      await fetchPayments();
      return true;
    } catch (e) {
      _error = 'Erreur lors du paiement';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  List<Payment> getPaymentsForLoan(String loanId) {
    return _payments.where((p) => p.loanId == loanId).toList();
  }
}
