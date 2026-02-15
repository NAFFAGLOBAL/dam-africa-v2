import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../models/loan.dart';

class LoanCard extends StatelessWidget {
  final Loan loan;
  final VoidCallback? onTap;

  const LoanCard({
    super.key,
    required this.loan,
    this.onTap,
  });

  Color _getStatusColor() {
    switch (loan.status) {
      case 'PENDING':
        return AppTheme.statusPending;
      case 'APPROVED':
        return AppTheme.statusApproved;
      case 'ACTIVE':
        return AppTheme.statusActive;
      case 'COMPLETED':
        return AppTheme.statusCompleted;
      case 'REJECTED':
        return AppTheme.statusRejected;
      default:
        return AppTheme.textSecondary;
    }
  }

  String _getStatusText() {
    switch (loan.status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Approuvé';
      case 'ACTIVE':
        return 'Actif';
      case 'COMPLETED':
        return 'Complété';
      case 'REJECTED':
        return 'Rejeté';
      default:
        return loan.status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat('#,##0', 'fr_FR');

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
                  Text(
                    '${formatter.format(loan.amount)} CFA',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.schedule, size: 16, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    '${loan.termWeeks} semaines',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Icon(Icons.percent, size: 16, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    '${loan.interestRate.toStringAsFixed(1)}%',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              if (loan.isActive) ...[
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: loan.progressPercentage / 100,
                  backgroundColor: AppTheme.border,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.secondary),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Payé: ${formatter.format(loan.paidAmount)} CFA',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    Text(
                      'Reste: ${formatter.format(loan.remainingBalance)} CFA',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
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
