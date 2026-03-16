import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../models/loan.dart';
import '../providers/loan_provider.dart';

class LoanDetailScreen extends ConsumerWidget {
  final String loanId;

  const LoanDetailScreen({super.key, required this.loanId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loanAsync = ref.watch(loanDetailProvider(loanId));
    final scheduleAsync = ref.watch(loanScheduleProvider(loanId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails du prêt'),
      ),
      body: loanAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Erreur: $error')),
        data: (loan) {
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(loanDetailProvider(loanId));
              ref.invalidate(loanScheduleProvider(loanId));
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Status & Amount Card
                  _LoanSummaryCard(loan: loan),
                  const SizedBox(height: 16),

                  // Details Card
                  _LoanDetailsCard(loan: loan),
                  const SizedBox(height: 16),

                  // Progress Card (for active loans)
                  if (loan.isActive) ...[
                    _ProgressCard(loan: loan),
                    const SizedBox(height: 16),
                  ],

                  // Payment Schedule
                  scheduleAsync.when(
                    loading: () => const Card(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                    ),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (schedule) {
                      if (schedule.isEmpty) return const SizedBox.shrink();
                      return _ScheduleCard(schedule: schedule);
                    },
                  ),

                  const SizedBox(height: 16),

                  // Make Payment Button
                  if (loan.isActive)
                    ElevatedButton.icon(
                      onPressed: () => context.push(
                        '/payments/create?loanId=${loan.id}',
                      ),
                      icon: const Icon(Icons.payment),
                      label: const Text('Effectuer un paiement'),
                    ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _LoanSummaryCard extends StatelessWidget {
  final Loan loan;

  const _LoanSummaryCard({required this.loan});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            StatusBadge.fromStatus(loan.status),
            const SizedBox(height: 16),
            Text(
              Formatters.currency(loan.amount),
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              loan.purpose ?? 'Prêt personnel',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            if (loan.creditRating != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.infoLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Score crédit: ${loan.creditScore} (${loan.creditRating})',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.info,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _LoanDetailsCard extends StatelessWidget {
  final Loan loan;

  const _LoanDetailsCard({required this.loan});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Détails',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            _DetailRow('Durée', '${loan.termMonths} mois'),
            _DetailRow('Taux d\'intérêt', Formatters.interestRate(loan.interestRate)),
            _DetailRow('Mensualité', Formatters.currency(loan.monthlyPayment)),
            _DetailRow('Total à rembourser', Formatters.currency(loan.totalRepayment)),
            _DetailRow('Date de demande', Formatters.date(loan.createdAt)),
            if (loan.approvedAt != null)
              _DetailRow('Date d\'approbation', Formatters.date(loan.approvedAt)),
            if (loan.disbursedAt != null)
              _DetailRow('Date de décaissement', Formatters.date(loan.disbursedAt)),
            if (loan.startDate != null)
              _DetailRow('Début', Formatters.date(loan.startDate)),
            if (loan.endDate != null)
              _DetailRow('Fin prévue', Formatters.date(loan.endDate)),
            if (loan.rejectedReason != null)
              _DetailRow('Motif de rejet', loan.rejectedReason!),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: 16),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  final Loan loan;

  const _ProgressCard({required this.loan});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Progression du remboursement',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Payé',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      Formatters.currency(loan.paidAmount),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Restant',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      Formatters.currency(loan.remainingAmount),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: loan.progressPercent,
                backgroundColor: AppColors.divider,
                color: AppColors.success,
                minHeight: 10,
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Text(
                '${(loan.progressPercent * 100).toStringAsFixed(1)}% remboursé',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScheduleCard extends StatelessWidget {
  final List<LoanSchedule> schedule;

  const _ScheduleCard({required this.schedule});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Échéancier de paiement',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            ...schedule.map((item) => _ScheduleItem(item: item)),
          ],
        ),
      ),
    );
  }
}

class _ScheduleItem extends StatelessWidget {
  final LoanSchedule item;

  const _ScheduleItem({required this.item});

  @override
  Widget build(BuildContext context) {
    final isPaid = item.isPaid;
    final isOverdue = item.isOverdue;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.divider, width: 0.5),
        ),
      ),
      child: Row(
        children: [
          // Status icon
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isPaid
                  ? AppColors.successLight
                  : isOverdue
                      ? AppColors.errorLight
                      : AppColors.background,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPaid
                  ? Icons.check
                  : isOverdue
                      ? Icons.warning
                      : Icons.schedule,
              size: 16,
              color: isPaid
                  ? AppColors.success
                  : isOverdue
                      ? AppColors.error
                      : AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: 12),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Échéance ${item.installment}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  Formatters.date(item.dueDate),
                  style: TextStyle(
                    fontSize: 12,
                    color: isOverdue ? AppColors.error : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Amount
          Text(
            Formatters.currency(item.amount),
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isPaid ? AppColors.success : AppColors.textPrimary,
              decoration: isPaid ? TextDecoration.lineThrough : null,
            ),
          ),
        ],
      ),
    );
  }
}
