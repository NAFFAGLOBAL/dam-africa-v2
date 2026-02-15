import '../config/api_config.dart';
import '../models/user.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  final ApiService _api = ApiService();
  final StorageService _storage = StorageService();

  Future<AuthResponse> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    final response = await _api.post(
      ApiConfig.register,
      data: {
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
      },
    );

    final authResponse = AuthResponse.fromJson(
      response.data as Map<String, dynamic>,
    );

    await _storage.saveTokens(
      authResponse.accessToken,
      authResponse.refreshToken,
    );
    await _storage.saveUserId(authResponse.user.id);

    return authResponse;
  }

  Future<AuthResponse> login({
    String? email,
    String? phone,
    required String password,
  }) async {
    final data = <String, dynamic>{'password': password};
    if (email != null) {
      data['email'] = email;
    } else if (phone != null) {
      data['phone'] = phone;
    }

    final response = await _api.post(ApiConfig.login, data: data);

    final authResponse = AuthResponse.fromJson(
      response.data as Map<String, dynamic>,
    );

    await _storage.saveTokens(
      authResponse.accessToken,
      authResponse.refreshToken,
    );
    await _storage.saveUserId(authResponse.user.id);

    return authResponse;
  }

  Future<User> getCurrentUser() async {
    final response = await _api.get(ApiConfig.me);
    return User.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> logout() async {
    await _storage.clearAll();
  }

  Future<bool> isLoggedIn() async {
    return await _storage.hasToken();
  }
}
