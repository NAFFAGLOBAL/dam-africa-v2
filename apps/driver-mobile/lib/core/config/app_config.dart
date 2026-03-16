class AppConfig {
  static const String appName = 'DAMFlotte CLD';
  static const String apiBaseUrl = 'http://localhost:3001/api/v1';
  static const String currency = 'FCFA';
  static const String countryCode = '225';
  static const String locale = 'fr_CI';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Pagination
  static const int defaultPageSize = 20;

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
}
