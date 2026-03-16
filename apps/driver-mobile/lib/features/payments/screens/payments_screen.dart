import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/loading_overlay.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../models/payment.dart';
import '../providers/payment_provider.dart';

class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentsAsync = ref.watch(paymentHistoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Paiements'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => context.push('/payments/create'),
            tooltip: 'Nouveau paiement',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(paymentHistoryProvider);
        },
        child: paymentsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                const SizedBox(height: 16),
                Text('Erreur: $error'),
                TextButton(
                  onPressed: () => ref.invalidate(paymentHistoryProvider),
                  child: const Text('Réessayer'),
                ),
              ],
            ),
          ),
          data: (payments) {
            if (payments.isEmpty) {
              return const EmptyState(
                icon: Icons.payments_outlined,
                title: 'Aucun paiement',
                subtitle: 'Votre historique de paiements est vide',
              );
            }

            // Group payments by month
            final grouped = <String, List<Payment>>{};
            for (final p in payments) {
              final date = DateTime.tryParse(p.createdAt);
              final key = date != null
                  ? '${_monthName(date.month)} ${date.year}'
                  : 'Autre';
              grouped.putIfAbsent(key, () => []).add(p);
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: grouped.length,
              itemBuilder: (context, index) {
                final month = grouped.keys.elementAt(index);
                final monthPayments = grouped[month]!;
                final total = monthPayments
                    .where((p) => p.isCompleted)
                    .fold<double>(0, (sum, p) => sum + p.amount);

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            month,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          if (total > 0)
                            Text(
                              Formatters.currency(total),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: AppColors.success,
                              ),
                            ),
                        ],
                      ),
                    ),
                    ...monthPayments.map((p) => _PaymentTile(payment: p)),
                    const SizedBox(height: 8),
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }

  static String _monthName(int month) {
    const months = [
      '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ];
    return months[month];
  }
}

class _PaymentTile extends StatelessWidget {
  final Payment payment;

  const _PaymentTile({required this.payment});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: payment.isCompleted
                ? AppColors.successLight
                : payment.isPending
                    ? AppColors.warningLight
                    : AppColors.errorLight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            _methodIcon(payment.method),
            color: payment.isCompleted
                ? AppColors.success
                : payment.isPending
                    ? AppColors.warning
                    : AppColors.error,
          ),
        ),
        title: Text(
          payment.methodLabel,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              payment.reference,
              style: const TextStyle(fontSize: 11, color: AppColors.textHint),
            ),
            Text(
              Formatters.relativeDate(payment.createdAt),
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              Formatters.currency(payment.amount),
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            StatusBadge.fromStatus(payment.status),
          ],
        ),
      ),
    );
  }

  IconData _methodIcon(String method) {
    switch (method) {
      case 'WAVE':
        return Icons.waves;
      case 'MOBILE_MONEY':
        return Icons.phone_android;
      case 'BANK_TRANSFER':
        return Icons.account_balance;
      case 'CASH':
        return Icons.money;
      default:
        return Icons.payment;
    }
  }
}
