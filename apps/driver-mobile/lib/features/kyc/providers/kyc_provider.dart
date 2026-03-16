import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_service.dart';
import '../../../models/kyc_document.dart';

enum KycLoadingState { initial, loading, loaded, error }

class KycState {
  final KycLoadingState loadingState;
  final KycStatus? status;
  final String? error;
  final bool isSubmitting;

  const KycState({
    this.loadingState = KycLoadingState.initial,
    this.status,
    this.error,
    this.isSubmitting = false,
  });

  KycState copyWith({
    KycLoadingState? loadingState,
    KycStatus? status,
    String? error,
    bool? isSubmitting,
  }) {
    return KycState(
      loadingState: loadingState ?? this.loadingState,
      status: status ?? this.status,
      error: error,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }

  bool get isLoading => loadingState == KycLoadingState.loading;
  bool get hasError => loadingState == KycLoadingState.error;
  bool get isLoaded => loadingState == KycLoadingState.loaded;

  int get approvedCount => status?.approved ?? 0;
  int get totalRequired => 4;
  double get progress =>
      totalRequired > 0 ? approvedCount / totalRequired : 0.0;

  KycDocument? documentForType(String type) {
    if (status == null) return null;
    try {
      return status!.documents.firstWhere((d) => d.type == type);
    } catch (_) {
      return null;
    }
  }

  bool isTypeSubmitted(String type) => documentForType(type) != null;
}

class KycNotifier extends StateNotifier<KycState> {
  final ApiService _api;
  final Dio _dio;

  KycNotifier(this._api, this._dio) : super(const KycState());

  Future<void> loadStatus() async {
    state = state.copyWith(loadingState: KycLoadingState.loading, error: null);
    try {
      final status = await _api.getKycStatus();
      state = KycState(
        loadingState: KycLoadingState.loaded,
        status: status,
      );
    } on ApiException catch (e) {
      state = KycState(
        loadingState: KycLoadingState.error,
        error: e.message,
      );
    } catch (e) {
      state = const KycState(
        loadingState: KycLoadingState.error,
        error: 'Impossible de charger le statut KYC',
      );
    }
  }

  Future<bool> submitDocument({
    required String type,
    required File imageFile,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final fileName = imageFile.path.split('/').last;
      final formData = FormData.fromMap({
        'type': type,
        'file': await MultipartFile.fromFile(
          imageFile.path,
          filename: fileName,
        ),
      });

      final response = await _dio.post(
        '/kyc/documents/upload',
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      final document = KycDocument.fromJson(
        response.data['data'] as Map<String, dynamic>,
      );

      // Update local state with the new document
      final currentDocs = List<KycDocument>.from(state.status?.documents ?? []);
      final existingIndex = currentDocs.indexWhere((d) => d.type == type);
      if (existingIndex >= 0) {
        currentDocs[existingIndex] = document;
      } else {
        currentDocs.add(document);
      }

      final pendingCount = currentDocs.where((d) => d.isPending).length;
      final approvedCount = currentDocs.where((d) => d.isApproved).length;
      final rejectedCount = currentDocs.where((d) => d.isRejected).length;

      state = state.copyWith(
        isSubmitting: false,
        status: KycStatus(
          isVerified: approvedCount >= 4,
          total: currentDocs.length,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
          documents: currentDocs,
        ),
      );

      return true;
    } on DioException catch (e) {
      final apiError = ApiException.fromDioException(e);
      state = state.copyWith(
        isSubmitting: false,
        error: apiError.message,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Erreur lors de l\'envoi du document',
      );
      return false;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final kycProvider = StateNotifierProvider<KycNotifier, KycState>((ref) {
  return KycNotifier(
    ref.watch(apiServiceProvider),
    ref.watch(dioProvider),
  );
});
