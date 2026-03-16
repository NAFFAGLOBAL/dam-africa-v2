import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api/api_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../models/credit_score.dart';
import '../../../models/kyc_document.dart';
import '../../../models/loan.dart';
import '../../../models/payment.dart';
import '../../auth/providers/auth_provider.dart';

// ─── Dashboard Data Model ────────────────────────────────────────

class DashboardData {
  final KycStatus kycStatus;
  final CreditScore? creditScore;
  final List<Loan> loans;
  final List<Payment> payments;

  const DashboardData({
    required this.kycStatus,
    this.creditScore,
    required this.loans,
    required this.payments,
  });

  Loan? get activeLoan {
    try {
      return loans.firstWhere((l) => l.isActive);
    } catch (_) {
      return null;
    }
  }

  List<Payment> get recentPayments =>
      payments.length > 3 ? payments.sublist(0, 3) : payments;
}

// ─── Providers ───────────────────────────────────────────────────

final dashboardDataProvider = FutureProvider.autoDispose<DashboardData>((ref) async {
  final api = ref.watch(apiServiceProvider);

  final results = await Future.wait([
    api.getKycStatus(),
    api.getCreditScore(),
    api.getMyLoans(),
    api.getPaymentHistory(),
  ]);

  return DashboardData(
    kycStatus: results[0] as KycStatus,
    creditScore: results[1] as CreditScore?,
    loans: results[2] as List<Loan>,
    payments: results[3] as List<Payment>,
  );
});

// ─── Dashboard Screen ────────────────────────────────────────────

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final dashboardAsync = ref.watch(dashboardDataProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          ref.invalidate(dashboardDataProvider);
          await ref.read(dashboardDataProvider.future);
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // ─── App Bar ───────────────────────────────────
            SliverAppBar(
              expandedHeight: 140,
              pinned: true,
              backgroundColor: AppColors.primary,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppColors.primary, AppColors.primaryDark],
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 24,
                                backgroundColor: AppColors.white.withOpacity(0.2),
                                child: Text(
                                  user != null
                                      ? '${user.firstName[0]}${user.lastName[0]}'
                                      : '',
                                  style: const TextStyle(
                                    color: AppColors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Bonjour, ${user?.firstName ?? ''}',
                                      style: const TextStyle(
                                        color: AppColors.white,
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    _buildKycBadge(dashboardAsync),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: () => context.push('/notifications'),
                                icon: const Icon(
                                  Icons.notifications_outlined,
                                  color: AppColors.white,
                                  size: 26,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // ─── Body ──────────────────────────────────────
            dashboardAsync.when(
              loading: () => const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              ),
              error: (error, _) => SliverFillRemaining(
                child: _ErrorView(
                  message: error.toString(),
                  onRetry: () => ref.invalidate(dashboardDataProvider),
                ),
              ),
              data: (data) => SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Quick Actions
                    _QuickActionsSection(kycStatus: data.kycStatus),
                    const SizedBox(height: 20),

                    // Active Loan
                    if (data.activeLoan != null) ...[
                      _ActiveLoanCard(loan: data.activeLoan!),
                      const SizedBox(height: 20),
                    ],

                    // Credit Score
                    _CreditScoreCard(creditScore: data.creditScore),
                    const SizedBox(height: 20),

                    // Recent Payments
                    _RecentPaymentsSection(payments: data.recentPayments),
                    const SizedBox(height: 24),
                  ]),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKycBadge(AsyncValue<DashboardData> dashboardAsync) {
    return dashboardAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (data) {
        if (data.kycStatus.isVerified) {
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.verified,
                color: AppColors.white.withOpacity(0.9),
                size: 16,
              ),
              const SizedBox(width: 4),
              Text(
                'Compte verifie',
                style: TextStyle(
                  color: AppColors.white.withOpacity(0.9),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          );
        }
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.warning_amber_rounded,
              color: AppColors.warningLight.withOpacity(0.9),
              size: 16,
            ),
            const SizedBox(width: 4),
            Text(
              'Verification en attente',
              style: TextStyle(
                color: AppColors.warningLight.withOpacity(0.9),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        );
      },
    );
  }
}

// ─── Quick Actions Section ───────────────────────────────────────

class _QuickActionsSection extends StatelessWidget {
  final KycStatus kycStatus;

  const _QuickActionsSection({required this.kycStatus});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Actions rapides',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _QuickActionCard(
                icon: Icons.verified_user_outlined,
                label: 'Verification\nKYC',
                color: kycStatus.isVerified ? AppColors.success : AppColors.warning,
                backgroundColor: kycStatus.isVerified
                    ? AppColors.successLight
                    : AppColors.warningLight,
                badge: kycStatus.isVerified ? 'OK' : null,
                onTap: () => context.push('/kyc'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _QuickActionCard(
                icon: Icons.account_balance_outlined,
                label: 'Demander\nun pret',
                color: AppColors.secondary,
                backgroundColor: AppColors.infoLight,
                onTap: () => context.push('/loans/apply'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _QuickActionCard(
                icon: Icons.payment_outlined,
                label: 'Effectuer\nun paiement',
                color: AppColors.primary,
                backgroundColor: AppColors.primary.withOpacity(0.1),
                onTap: () => context.push('/payments/create'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final Color backgroundColor;
  final String? badge;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.backgroundColor,
    this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(16),
      elevation: 0,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider.withOpacity(0.5)),
          ),
          child: Column(
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: backgroundColor,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(icon, color: color, size: 26),
                  ),
                  if (badge != null)
                    Positioned(
                      top: -4,
                      right: -4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.success,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          badge!,
                          style: const TextStyle(
                            color: AppColors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Active Loan Card ────────────────────────────────────────────

class _ActiveLoanCard extends StatelessWidget {
  final Loan loan;

  const _ActiveLoanCard({required this.loan});

  @override
  Widget build(BuildContext context) {
    final nextPayment = _findNextPayment();

    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(16),
      elevation: 0,
      child: InkWell(
        onTap: () => context.push('/loans/${loan.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider.withOpacity(0.5)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Pret actif',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  StatusBadge.fromStatus(loan.status),
                ],
              ),
              const SizedBox(height: 16),

              // Amount
              Text(
                Formatters.currency(loan.amount),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppColors.secondary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'sur ${loan.termMonths} mois a ${Formatters.interestRate(loan.interestRate)}',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 20),

              // Progress Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Remboursement',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Text(
                    Formatters.percent(loan.progressPercent),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: loan.progressPercent.toDouble(),
                  minHeight: 10,
                  backgroundColor: AppColors.divider.withOpacity(0.4),
                  valueColor: AlwaysStoppedAnimation<Color>(
                    loan.progressPercent >= 0.75
                        ? AppColors.success
                        : AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Paye: ${Formatters.compactCurrency(loan.paidAmount)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Text(
                    'Reste: ${Formatters.compactCurrency(loan.remainingAmount)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),

              // Next Payment Due
              if (nextPayment != null) ...[
                const Divider(height: 28, color: AppColors.divider),
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: nextPayment.isOverdue
                            ? AppColors.errorLight
                            : AppColors.warningLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        nextPayment.isOverdue
                            ? Icons.warning_rounded
                            : Icons.calendar_today_rounded,
                        color: nextPayment.isOverdue
                            ? AppColors.error
                            : AppColors.warning,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            nextPayment.isOverdue
                                ? 'Paiement en retard'
                                : 'Prochain paiement',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: nextPayment.isOverdue
                                  ? AppColors.error
                                  : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${Formatters.currency(nextPayment.amount)} - ${Formatters.date(nextPayment.dueDate)}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.chevron_right,
                      color: AppColors.textHint,
                      size: 22,
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  LoanSchedule? _findNextPayment() {
    if (loan.schedule == null || loan.schedule!.isEmpty) return null;
    try {
      return loan.schedule!.firstWhere((s) => !s.isPaid);
    } catch (_) {
      return null;
    }
  }
}

// ─── Credit Score Card ───────────────────────────────────────────

class _CreditScoreCard extends StatelessWidget {
  final CreditScore? creditScore;

  const _CreditScoreCard({this.creditScore});

  Color _ratingColor(String rating) {
    switch (rating) {
      case 'A':
        return AppColors.ratingA;
      case 'B':
        return AppColors.ratingB;
      case 'C':
        return AppColors.ratingC;
      case 'D':
        return AppColors.ratingD;
      case 'E':
        return AppColors.ratingE;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(16),
      elevation: 0,
      child: InkWell(
        onTap: () => context.push('/credit-score'),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider.withOpacity(0.5)),
          ),
          child: creditScore != null
              ? _buildScoreContent(creditScore!)
              : _buildNoScoreContent(),
        ),
      ),
    );
  }

  Widget _buildScoreContent(CreditScore score) {
    final color = _ratingColor(score.rating);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Score de credit',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                score.ratingLabel,
                style: TextStyle(
                  color: color,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Score Display
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${score.score}',
              style: TextStyle(
                fontSize: 44,
                fontWeight: FontWeight.w800,
                color: color,
                height: 1,
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(
                ' / 1000',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
            const Spacer(),
            // Rating Circle
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: color, width: 3),
              ),
              child: Center(
                child: Text(
                  score.rating,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Score Progress Bar
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: score.scorePercent,
            minHeight: 8,
            backgroundColor: AppColors.divider.withOpacity(0.4),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
        const SizedBox(height: 16),

        // Score Breakdown
        Row(
          children: [
            _ScoreDetail(
              label: 'Paiements',
              value: '${score.paymentScore}',
              icon: Icons.payments_outlined,
            ),
            const SizedBox(width: 16),
            _ScoreDetail(
              label: 'Revenus',
              value: '${score.incomeScore}',
              icon: Icons.trending_up_rounded,
            ),
            const SizedBox(width: 16),
            _ScoreDetail(
              label: 'Conduite',
              value: '${score.drivingScore}',
              icon: Icons.directions_car_outlined,
            ),
          ],
        ),

        if (score.maxLoanAmount > 0) ...[
          const Divider(height: 24, color: AppColors.divider),
          Row(
            children: [
              const Icon(
                Icons.info_outline,
                size: 16,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                'Montant max: ${Formatters.compactCurrency(score.maxLoanAmount)}',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildNoScoreContent() {
    return Column(
      children: [
        const Icon(
          Icons.analytics_outlined,
          size: 48,
          color: AppColors.textHint,
        ),
        const SizedBox(height: 12),
        const Text(
          'Score de credit',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Votre score de credit n\'est pas encore disponible. '
          'Completez votre KYC pour commencer.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.4,
          ),
        ),
      ],
    );
  }
}

class _ScoreDetail extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _ScoreDetail({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: AppColors.textSecondary),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Recent Payments Section ─────────────────────────────────────

class _RecentPaymentsSection extends StatelessWidget {
  final List<Payment> payments;

  const _RecentPaymentsSection({required this.payments});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Paiements recents',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            if (payments.isNotEmpty)
              TextButton(
                onPressed: () => context.push('/payments'),
                child: const Text(
                  'Voir tout',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),
        if (payments.isEmpty)
          _buildEmptyPayments()
        else
          Container(
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.divider.withOpacity(0.5)),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: payments.length,
              separatorBuilder: (_, __) => const Divider(
                height: 1,
                indent: 68,
                color: AppColors.divider,
              ),
              itemBuilder: (context, index) {
                return _PaymentTile(payment: payments[index]);
              },
            ),
          ),
      ],
    );
  }

  Widget _buildEmptyPayments() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider.withOpacity(0.5)),
      ),
      child: const Column(
        children: [
          Icon(
            Icons.receipt_long_outlined,
            size: 40,
            color: AppColors.textHint,
          ),
          SizedBox(height: 10),
          Text(
            'Aucun paiement',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'Vos paiements apparaitront ici',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textHint,
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  final Payment payment;

  const _PaymentTile({required this.payment});

  IconData _methodIcon(String method) {
    switch (method) {
      case 'WAVE':
        return Icons.waves_rounded;
      case 'MOBILE_MONEY':
        return Icons.phone_android_rounded;
      case 'BANK_TRANSFER':
        return Icons.account_balance_rounded;
      case 'CASH':
        return Icons.money_rounded;
      default:
        return Icons.payment_rounded;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'COMPLETED':
        return AppColors.success;
      case 'PENDING':
      case 'PROCESSING':
        return AppColors.pending;
      case 'FAILED':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push('/payments/${payment.id}'),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: _statusColor(payment.status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _methodIcon(payment.method),
                color: _statusColor(payment.status),
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    payment.methodLabel,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    Formatters.relativeDate(payment.createdAt),
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  Formatters.currency(payment.amount),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                StatusBadge.fromStatus(payment.status),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Error View ──────────────────────────────────────────────────

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_off_rounded,
              size: 56,
              color: AppColors.textHint,
            ),
            const SizedBox(height: 16),
            const Text(
              'Erreur de chargement',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Reessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
