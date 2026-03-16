import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import 'token_storage.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  dio.interceptors.add(AuthInterceptor(ref));
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
    logPrint: (obj) => print('[API] $obj'),
  ));

  return dio;
});

class AuthInterceptor extends Interceptor {
  final Ref _ref;

  AuthInterceptor(this._ref);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final tokenStorage = _ref.read(tokenStorageProvider);
    final token = await tokenStorage.getAccessToken();

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final tokenStorage = _ref.read(tokenStorageProvider);
      final refreshToken = await tokenStorage.getRefreshToken();

      if (refreshToken != null) {
        try {
          final dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
          final response = await dio.post('/auth/refresh', data: {
            'refreshToken': refreshToken,
          });

          if (response.statusCode == 200) {
            final data = response.data['data'];
            await tokenStorage.saveTokens(
              accessToken: data['accessToken'],
              refreshToken: data['refreshToken'],
            );

            // Retry original request
            final options = err.requestOptions;
            options.headers['Authorization'] =
                'Bearer ${data['accessToken']}';
            final retryResponse = await dio.fetch(options);
            return handler.resolve(retryResponse);
          }
        } catch (_) {
          await tokenStorage.clearAll();
        }
      }
    }

    handler.next(err);
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;

  ApiException({
    required this.message,
    this.statusCode,
    this.code,
  });

  factory ApiException.fromDioException(DioException e) {
    final data = e.response?.data;
    String message = 'Une erreur est survenue';

    if (data is Map<String, dynamic>) {
      final error = data['error'];
      if (error is Map<String, dynamic>) {
        message = error['message'] as String? ?? message;
      } else if (data['message'] is String) {
        message = data['message'] as String;
      }
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      message = 'Connexion au serveur expirée';
    } else if (e.type == DioExceptionType.connectionError) {
      message = 'Impossible de se connecter au serveur';
    }

    return ApiException(
      message: message,
      statusCode: e.response?.statusCode,
    );
  }

  @override
  String toString() => message;
}
