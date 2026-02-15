import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  Future<bool> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.register(
        name: name,
        email: email,
        phone: phone,
        password: password,
      );
      _user = response.user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _extractErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> login({
    String? email,
    String? phone,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.login(
        email: email,
        phone: phone,
        password: password,
      );
      _user = response.user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _extractErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadUser() async {
    _isLoading = true;
    notifyListeners();

    try {
      _user = await _authService.getCurrentUser();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = _extractErrorMessage(e);
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }

  Future<bool> checkAuth() async {
    return await _authService.isLoggedIn();
  }

  String _extractErrorMessage(dynamic error) {
    if (error.toString().contains('EMAIL_EXISTS')) {
      return 'Cette adresse email existe déjà';
    } else if (error.toString().contains('PHONE_EXISTS')) {
      return 'Ce numéro de téléphone existe déjà';
    } else if (error.toString().contains('INVALID_CREDENTIALS')) {
      return 'Email/téléphone ou mot de passe incorrect';
    } else if (error.toString().contains('SocketException')) {
      return 'Erreur de connexion. Vérifiez votre internet.';
    }
    return 'Une erreur est survenue. Réessayez.';
  }
}
