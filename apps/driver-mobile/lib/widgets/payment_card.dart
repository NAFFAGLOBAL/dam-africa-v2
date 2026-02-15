import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../models/payment.dart';

class PaymentCard extends StatelessWidget {
  final Payment payment;
  final VoidCallback? onTap;

  const PaymentCard({
    super.key,
    required this.payment,
    this.onTap,
  });

  Color _getStatusColor() {
    switch (payment.status) {
      case 'COMPLETED':
        return AppTheme.statusApproved;
      case 'PENDING':
        return AppTheme.statusPending;
      case 'FAILED':
        return AppTheme.statusRejected;
      default:
        return AppTheme.textSecondary;
    }
  }

  String _getStatusText() {
    switch (payment.status) {
      case 'COMPLETED':
        return 'Complété';
      case 'PENDING':
        return 'En attente';
      case 'FAILED':
        return 'Échoué';
      default:
        return payment.status;
    }
  }

  String _getMethodName() {
    switch (payment.method) {
      case 'WAVE':
        return 'Wave';
      case 'ORANGE_MONEY':
        return 'Orange Money';
      case 'MTN_MONEY':
        return 'MTN Mobile Money';
      default:
        return payment.method;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat('#,##0', 'fr_FR');
    final dateFormatter = DateFormat('d MMM yyyy HH:mm', 'fr_FR');

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${formatter.format(payment.amount)} CFA',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _getStatusText(),
                      style: TextStyle(
                        color: _getStatusColor(),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.payment, size: 16, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    _getMethodName(),
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.access_time, size: 16, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    dateFormatter.format(payment.createdAt),
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              if (payment.reference != null) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.confirmation_number, size: 16, color: AppTheme.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      payment.reference!,
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 12,
                      ),
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
}
