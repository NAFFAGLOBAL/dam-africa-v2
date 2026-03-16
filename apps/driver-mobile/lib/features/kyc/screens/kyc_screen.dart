import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/loading_overlay.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../models/kyc_document.dart';
import '../providers/kyc_provider.dart';

class KycScreen extends ConsumerStatefulWidget {
  const KycScreen({super.key});

  @override
  ConsumerState<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends ConsumerState<KycScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(kycProvider.notifier).loadStatus();
    });
  }

  static const List<_RequiredDocType> _requiredDocTypes = [
    _RequiredDocType(
      type: 'NATIONAL_ID',
      label: 'Carte d\'identit\u00e9',
      icon: Icons.badge_outlined,
    ),
    _RequiredDocType(
      type: 'DRIVERS_LICENSE',
      label: 'Permis de conduire',
      icon: Icons.directions_car_outlined,
    ),
    _RequiredDocType(
      type: 'PROOF_OF_ADDRESS',
      label: 'Justificatif de domicile',
      icon: Icons.home_outlined,
    ),
    _RequiredDocType(
      type: 'SELFIE',
      label: 'Photo selfie',
      icon: Icons.camera_alt_outlined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final kycState = ref.watch(kycProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('V\u00e9rification KYC'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: LoadingOverlay(
        isLoading: kycState.isLoading,
        message: 'Chargement...',
        child: _buildBody(kycState),
      ),
    );
  }

  Widget _buildBody(KycState kycState) {
    if (kycState.hasError) {
      return _buildErrorState(kycState.error ?? 'Une erreur est survenue');
    }

    if (!kycState.isLoaded && !kycState.isLoading) {
      return const SizedBox.shrink();
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () => ref.read(kycProvider.notifier).loadStatus(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildStatusHeader(kycState),
          const SizedBox(height: 20),
          _buildProgressCard(kycState),
          const SizedBox(height: 24),
          const Text(
            'Documents requis',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          ..._requiredDocTypes.map(
            (docType) => _buildDocumentCard(kycState, docType),
          ),
          const SizedBox(height: 24),
          _buildUploadButton(),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.read(kycProvider.notifier).loadStatus(),
              icon: const Icon(Icons.refresh),
              label: const Text('R\u00e9essayer'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusHeader(KycState kycState) {
    final isVerified = kycState.status?.isVerified ?? false;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isVerified
              ? [AppColors.success, AppColors.success.withOpacity(0.8)]
              : [AppColors.secondary, AppColors.secondaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isVerified ? Icons.verified : Icons.shield_outlined,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isVerified ? 'Identit\u00e9 v\u00e9rifi\u00e9e' : 'V\u00e9rification en cours',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isVerified
                      ? 'Tous vos documents ont \u00e9t\u00e9 approuv\u00e9s'
                      : 'Soumettez vos documents pour compl\u00e9ter la v\u00e9rification',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressCard(KycState kycState) {
    final approved = kycState.approvedCount;
    final total = kycState.totalRequired;
    final progress = kycState.progress;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Progression',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                '$approved/$total approuv\u00e9s',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 10,
              backgroundColor: AppColors.divider,
              valueColor: AlwaysStoppedAnimation<Color>(
                approved == total ? AppColors.success : AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatChip(
                '${kycState.status?.pending ?? 0}',
                'En attente',
                AppColors.pending,
              ),
              _buildStatChip(
                '${kycState.status?.approved ?? 0}',
                'Approuv\u00e9s',
                AppColors.success,
              ),
              _buildStatChip(
                '${kycState.status?.rejected ?? 0}',
                'Rejet\u00e9s',
                AppColors.error,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(String count, String label, Color color) {
    return Column(
      children: [
        Text(
          count,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildDocumentCard(KycState kycState, _RequiredDocType docType) {
    final document = kycState.documentForType(docType.type);
    final isSubmitted = document != null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSubmitted
              ? _borderColorForStatus(document.status)
              : AppColors.divider,
          width: isSubmitted ? 1.5 : 1.0,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isSubmitted
                  ? _backgroundColorForStatus(document.status)
                  : AppColors.background,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              docType.icon,
              color: isSubmitted
                  ? _borderColorForStatus(document.status)
                  : AppColors.textHint,
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  docType.label,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                if (isSubmitted && document.reviewNote != null)
                  Text(
                    document.reviewNote!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  )
                else if (!isSubmitted)
                  const Text(
                    'Non soumis',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textHint,
                    ),
                  ),
              ],
            ),
          ),
          if (isSubmitted)
            StatusBadge.fromStatus(document.status)
          else
            OutlinedButton.icon(
              onPressed: () => context.push('/kyc/upload?type=${docType.type}'),
              icon: const Icon(Icons.upload_outlined, size: 18),
              label: const Text('Soumettre'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                textStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Color _borderColorForStatus(String status) {
    switch (status) {
      case 'APPROVED':
        return AppColors.success;
      case 'REJECTED':
        return AppColors.error;
      case 'PENDING':
        return AppColors.pending;
      default:
        return AppColors.divider;
    }
  }

  Color _backgroundColorForStatus(String status) {
    switch (status) {
      case 'APPROVED':
        return AppColors.successLight;
      case 'REJECTED':
        return AppColors.errorLight;
      case 'PENDING':
        return AppColors.warningLight;
      default:
        return AppColors.background;
    }
  }

  Widget _buildUploadButton() {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton.icon(
        onPressed: () => context.push('/kyc/upload'),
        icon: const Icon(Icons.add_a_photo_outlined),
        label: const Text(
          'Soumettre un document',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textOnPrimary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
        ),
      ),
    );
  }
}

class _RequiredDocType {
  final String type;
  final String label;
  final IconData icon;

  const _RequiredDocType({
    required this.type,
    required this.label,
    required this.icon,
  });
}
