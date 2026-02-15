class ApiConfig {
  static const String baseUrl = 'http://localhost:3001/api/v1';

  // Auth endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String me = '/auth/me';

  // KYC endpoints
  static const String kycSubmit = '/kyc/submit';
  static const String kycDocuments = '/kyc/documents';
  static const String kycStatus = '/kyc/status';

  // Credit endpoints
  static const String creditScore = '/credit/score';
  static const String creditHistory = '/credit/history';
  static const String creditRecalculate = '/credit/recalculate';

  // Loan endpoints
  static const String loanEligibility = '/loans/eligibility';
  static const String loanCalculate = '/loans/calculate';
  static const String loanApply = '/loans/apply';
  static const String loans = '/loans';

  // Payment endpoints
  static const String payments = '/payments';

  // Vehicle endpoints
  static const String vehicles = '/vehicles';

  // Notification endpoints
  static const String notifications = '/notifications';
  static const String notificationsUnreadCount = '/notifications/unread-count';
  static const String notificationsReadAll = '/notifications/read-all';

  static String loanDetail(String id) => '/loans/$id';
  static String loanSchedule(String id) => '/loans/$id/schedule';
  static String paymentDetail(String id) => '/payments/$id';
  static String notificationRead(String id) => '/notifications/$id/read';
}
