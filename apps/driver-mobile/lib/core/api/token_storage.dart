import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/app_config.dart';
import '../../models/user.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage();
});

class TokenStorage {
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: AppConfig.accessTokenKey, value: accessToken),
      _storage.write(key: AppConfig.refreshTokenKey, value: refreshToken),
    ]);
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: AppConfig.accessTokenKey);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: AppConfig.refreshTokenKey);
  }

  Future<void> saveUser(User user) async {
    await _storage.write(
      key: AppConfig.userDataKey,
      value: jsonEncode(user.toJson()),
    );
  }

  Future<User?> getUser() async {
    final data = await _storage.read(key: AppConfig.userDataKey);
    if (data == null) return null;
    return User.fromJson(jsonDecode(data) as Map<String, dynamic>);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  Future<bool> hasTokens() async {
    final token = await getAccessToken();
    return token != null;
  }
}
