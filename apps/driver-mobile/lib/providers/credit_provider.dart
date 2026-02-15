import 'package:flutter/foundation.dart';
import '../config/api_config.dart';
import '../models/credit_score.dart';
import '../services/api_service.dart';

class CreditProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  CreditScore? _creditScore;
  List<CreditScoreHistory> _history = [];
  bool _isLoading = false;
  String? _error;

  CreditScore? get creditScore => _creditScore;
  List<CreditScoreHistory> get history => _history;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchCreditScore() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.creditScore);
      _creditScore = CreditScore.fromJson(
        response.data as Map<String, dynamic>,
      );
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Erreur lors du chargement du score';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchCreditHistory() async {
    try {
      final response = await _api.get(ApiConfig.creditHistory);
      final data = response.data as List<dynamic>;
      _history = data
          .map((json) =>
              CreditScoreHistory.fromJson(json as Map<String, dynamic>))
          .toList();
      notifyListeners();
    } catch (e) {
      _error = 'Erreur lors du chargement de l\'historique';
      notifyListeners();
    }
  }

  Future<void> recalculateScore() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _api.post(ApiConfig.creditRecalculate);
      await fetchCreditScore();
    } catch (e) {
      _error = 'Erreur lors du recalcul du score';
      _isLoading = false;
      notifyListeners();
    }
  }
}
