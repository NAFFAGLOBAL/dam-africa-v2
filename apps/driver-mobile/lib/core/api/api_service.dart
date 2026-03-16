import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/auth_response.dart';
import '../../models/credit_score.dart';
import '../../models/kyc_document.dart';
import '../../models/loan.dart';
import '../../models/payment.dart';
import '../../models/user.dart';
import '../../models/vehicle.dart';
import 'api_client.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(ref.watch(dioProvider));
});

class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  // ─── Auth ──────────────────────────────────────────────

  Future<AuthResponse> register({
    required String email,
    required String phone,
    required String password,
    required String firstName,
    required String lastName,
    String? dateOfBirth,
    String? city,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'email': email,
        'phone': phone,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
        if (city != null) 'city': city,
      });
      return AuthResponse.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      return AuthResponse.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<void> logout({String? refreshToken}) async {
    try {
      await _dio.post('/auth/logout', data: {
        if (refreshToken != null) 'refreshToken': refreshToken,
      });
    } on DioException catch (_) {
      // Ignore logout errors
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _dio.post('/auth/change-password', data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // ─── User Profile ─────────────────────────────────────

  Future<User> getProfile() async {
    try {
      final response = await _dio.get('/users/me');
      return User.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<User> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch('/users/me', data: data);
      return User.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // ─── KYC ──────────────────────────────────────────────

  Future<KycStatus> getKycStatus() async {
    try {
      final response = await _dio.get('/kyc/my-status');
      return KycStatus.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<KycDocument> submitKycDocument({
    required String type,
    required String fileUrl,
    String? fileName,
    String? expiresAt,
  }) async {
    try {
      final response = await _dio.post('/kyc/documents', data: {
        'type': type,
        'fileUrl': fileUrl,
        if (fileName != null) 'fileName': fileName,
        if (expiresAt != null) 'expiresAt': expiresAt,
      });
      return KycDocument.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // ─── Credit Score ─────────────────────────────────────

  Future<CreditScore?> getCreditScore() async {
    try {
      final response = await _dio.get('/credit/my-score');
      return CreditScore.fromJson(response.data['data']);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw ApiException.fromDioException(e);
    }
  }

  Future<List<CreditScore>> getCreditScoreHistory({int page = 1}) async {
    try {
      final response = await _dio.get('/credit/my-score/history', queryParameters: {
        'page': page,
        'limit': 20,
      });
      final records = response.data['data'] as List<dynamic>;
      return records
          .map((r) => CreditScore.fromJson(r as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // ─── Loans ────────────────────────────────────────────

  Future<LoanEligibility> checkLoanEligibility() async {
    try {
      final response = await _dio.get('/loans/eligibility');
      return LoanEligibility.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<Loan> applyForLoan({
    required double amount,
    required int termMonths,
    String? purpose,
  }) async {
    try {
      final response = await _dio.post('/loans/apply', data: {
        'amount': amount,
        'termMonths': termMonths,
        if (purpose != null) 'purpose': purpose,
      });
      return Loan.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<List<Loan>> getMyLoans() async {
    try {
      final response = await _dio.get('/loans/my-loans');
      final loans = response.data['data'] as List<dynamic>;
      return loans.map((l) => Loan.fromJson(l as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<Loan> getLoanDetails(String loanId) async {
    try {
      final response = await _dio.get('/loans/$loanId');
      return Loan.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<List<LoanSchedule>> getLoanSchedule(String loanId) async {
    try {
      final response = await _dio.get('/loans/$loanId/schedule');
      final items = response.data['data'] as List<dynamic>;
      return items
          .map((s) => LoanSchedule.fromJson(s as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // ─── Payments ─────────────────────────────────────────

  Future<Payment> createPayment({
    String? loanId,
    required double amount,
    required String method,
    String? phone,
    String? description,
  }) async {
    try {
      final response = await _dio.post('/payments', data: {
        if (loanId != null) 'loanId': loanId,
        'amount': amount,
        'method': method,
        if (phone != null) 'phone': phone,
        if (description != null) 'description': description,
      });
      return Payment.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<List<Payment>> getPaymentHistory() async {
    try {
      final response = await _dio.get('/payments/history');
      final payments = response.data['data'] as List<dynamic>;
      return payments
          .map((p) => Payment.fromJson(p as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<Payment> getPaymentDetails(String paymentId) async {
    try {
      final response = await _dio.get('/payments/$paymentId');
      return Payment.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  // ─── Vehicles ─────────────────────────────────────────

  Future<List<Vehicle>> getFavoriteVehicles() async {
    try {
      final response = await _dio.get('/vehicles/favorites');
      final vehicles = response.data['data'] as List<dynamic>;
      return vehicles
          .map((v) => Vehicle.fromJson(v as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<bool> toggleVehicleFavorite(String vehicleId) async {
    try {
      final response = await _dio.post('/vehicles/$vehicleId/favorite');
      return response.data['data']['favorited'] as bool;
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }
}
