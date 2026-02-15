import 'package:flutter/foundation.dart';
import '../config/api_config.dart';
import '../models/loan.dart';
import '../services/api_service.dart';

class LoanProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  List<Loan> _loans = [];
  LoanEligibility? _eligibility;
  LoanCalculation? _calculation;
  List<PaymentSchedule> _schedule = [];
  bool _isLoading = false;
  String? _error;

  List<Loan> get loans => _loans;
  LoanEligibility? get eligibility => _eligibility;
  LoanCalculation? get calculation => _calculation;
  List<PaymentSchedule> get schedule => _schedule;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Loan> get activeLoans =>
      _loans.where((loan) => loan.isActive).toList();
  List<Loan> get pastLoans =>
      _loans.where((loan) => !loan.isActive).toList();

  Loan? get currentActiveLoan {
    final active = activeLoans;
    return active.isNotEmpty ? active.first : null;
  }

  Future<void> fetchLoans() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.loans);
      final data = response.data as List<dynamic>;
      _loans = data.map((json) => Loan.fromJson(json as Map<String, dynamic>)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Erreur lors du chargement des prêts';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> checkEligibility() async {
    try {
      final response = await _api.get(ApiConfig.loanEligibility);
      _eligibility = LoanEligibility.fromJson(
        response.data as Map<String, dynamic>,
      );
      notifyListeners();
    } catch (e) {
      _error = 'Erreur lors de la vérification d\'éligibilité';
      notifyListeners();
    }
  }

  Future<void> calculateLoan(double amount, int termWeeks) async {
    try {
      final response = await _api.post(
        ApiConfig.loanCalculate,
        data: {
          'amount': amount,
          'termWeeks': termWeeks,
        },
      );
      _calculation = LoanCalculation.fromJson(
        response.data as Map<String, dynamic>,
      );
      notifyListeners();
    } catch (e) {
      _error = 'Erreur lors du calcul du prêt';
      notifyListeners();
    }
  }

  Future<bool> applyForLoan({
    required double amount,
    required int termWeeks,
    String? purpose,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _api.post(
        ApiConfig.loanApply,
        data: {
          'amount': amount,
          'termWeeks': termWeeks,
          if (purpose != null) 'purpose': purpose,
        },
      );
      _isLoading = false;
      notifyListeners();
      await fetchLoans();
      return true;
    } catch (e) {
      _error = 'Erreur lors de la demande de prêt';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchLoanSchedule(String loanId) async {
    try {
      final response = await _api.get(ApiConfig.loanSchedule(loanId));
      final data = response.data as List<dynamic>;
      _schedule = data
          .map((json) => PaymentSchedule.fromJson(json as Map<String, dynamic>))
          .toList();
      notifyListeners();
    } catch (e) {
      _error = 'Erreur lors du chargement du calendrier';
      notifyListeners();
    }
  }

  Loan? getLoanById(String id) {
    try {
      return _loans.firstWhere((loan) => loan.id == id);
    } catch (e) {
      return null;
    }
  }
}
