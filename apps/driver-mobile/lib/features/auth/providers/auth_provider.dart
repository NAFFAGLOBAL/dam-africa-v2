import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_service.dart';
import '../../../core/api/token_storage.dart';
import '../../../models/user.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? error;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.error,
  });

  AuthState copyWith({AuthStatus? status, User? user, String? error}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: error,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _api;
  final TokenStorage _tokenStorage;

  AuthNotifier(this._api, this._tokenStorage) : super(const AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final hasTokens = await _tokenStorage.hasTokens();
    if (hasTokens) {
      try {
        final user = await _api.getProfile();
        await _tokenStorage.saveUser(user);
        state = AuthState(status: AuthStatus.authenticated, user: user);
      } catch (_) {
        await _tokenStorage.clearAll();
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      final response = await _api.login(email: email, password: password);
      await _tokenStorage.saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      await _tokenStorage.saveUser(response.user);
      state = AuthState(
        status: AuthStatus.authenticated,
        user: response.user,
      );
    } on ApiException catch (e) {
      state = AuthState(status: AuthStatus.error, error: e.message);
    } catch (e) {
      state = const AuthState(
        status: AuthStatus.error,
        error: 'Une erreur est survenue',
      );
    }
  }

  Future<void> register({
    required String email,
    required String phone,
    required String password,
    required String firstName,
    required String lastName,
    String? dateOfBirth,
    String? city,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      final response = await _api.register(
        email: email,
        phone: phone,
        password: password,
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
        city: city,
      );
      await _tokenStorage.saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      await _tokenStorage.saveUser(response.user);
      state = AuthState(
        status: AuthStatus.authenticated,
        user: response.user,
      );
    } on ApiException catch (e) {
      state = AuthState(status: AuthStatus.error, error: e.message);
    } catch (e) {
      state = const AuthState(
        status: AuthStatus.error,
        error: 'Une erreur est survenue',
      );
    }
  }

  Future<void> logout() async {
    final refreshToken = await _tokenStorage.getRefreshToken();
    await _api.logout(refreshToken: refreshToken);
    await _tokenStorage.clearAll();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> refreshProfile() async {
    try {
      final user = await _api.getProfile();
      await _tokenStorage.saveUser(user);
      state = state.copyWith(user: user);
    } catch (_) {
      // Silently fail
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(apiServiceProvider),
    ref.watch(tokenStorageProvider),
  );
});
