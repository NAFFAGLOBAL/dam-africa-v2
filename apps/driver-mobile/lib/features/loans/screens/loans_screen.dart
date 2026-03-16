import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/loading_overlay.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../models/loan.dart';
import '../providers/loan_provider.dart';

class LoansScreen extends ConsumerWidget {
  const LoansScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loansAsync = ref.watch(myLoansProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes prêts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => context.push('/loans/apply'),
            tooltip: 'Demander un prêt',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myLoansProvider);
        },
        child: loansAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                const SizedBox(height: 16),
                Text('Erreur: $error'),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => ref.invalidate(myLoansProvider),
                  child: const Text('Réessayer'),
                ),
              ],
            ),
          ),
          data: (loans) {
            if (loans.isEmpty) {
              return EmptyState(
                icon: Icons.account_balance_outlined,
                title: 'Aucun prêt',
                subtitle: 'Vous n\'avez pas encore de demande de prêt',
                actionLabel: 'Demander un prêt',
                onAction: () => context.push('/loans/apply'),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: loans.length,
              itemBuilder: (context, index) {
                return _LoanCard(loan: loans[index]);
              },
            );
          },
        ),
      ),
    );
  }
}

class _LoanCard extends StatelessWidget {
  final Loan loan;

  const _LoanCard({required this.loan});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => context.push('/loans/${loan.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      loan.purpose ?? 'Prêt personnel',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  StatusBadge.fromStatus(loan.status),
                ],
              ),

              const SizedBox(height: 12),

              // Amount
              Text(
                Formatters.currency(loan.amount),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),

              const SizedBox(height: 12),

              // Details row
              Row(
                children: [
                  _DetailChip(
                    icon: Icons.calendar_today,
                    label: '${loan.termMonths} mois',
                  ),
                  const SizedBox(width: 16),
                  _DetailChip(
                    icon: Icons.percent,
                    label: Formatters.interestRate(loan.interestRate),
                  ),
                  const SizedBox(width: 16),
                  _DetailChip(
                    icon: Icons.payments,
                    label: '${Formatters.compactCurrency(loan.monthlyPayment)}/mois',
                  ),
                ],
              ),

              // Progress bar for active loans
              if (loan.isActive) ...[
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Remboursé: ${Formatters.currency(loan.paidAmount)}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      Formatters.percent(loan.progressPercent),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: loan.progressPercent,
                    backgroundColor: AppColors.divider,
                    color: AppColors.primary,
                    minHeight: 6,
                  ),
                ),
              ],

              // Date
              const SizedBox(height: 12),
              Text(
                'Soumis le ${Formatters.date(loan.createdAt)}',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _DetailChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.textSecondary),
        const SizedBox(width: 4),
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
}
