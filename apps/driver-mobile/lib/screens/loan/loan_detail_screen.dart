import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../models/loan.dart';
import '../../providers/loan_provider.dart';
import '../../utils/formatters.dart';
import '../../widgets/common/loading_widget.dart';

class LoanDetailScreen extends StatefulWidget {
  final String loanId;

  const LoanDetailScreen({super.key, required this.loanId});

  @override
  State<LoanDetailScreen> createState() => _LoanDetailScreenState();
}

class _LoanDetailScreenState extends State<LoanDetailScreen> {
  @override
  void initState() {
    super.initState();
    _loadSchedule();
  }

  Future<void> _loadSchedule() async {
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    await loanProvider.fetchLoanSchedule(widget.loanId);
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PAID':
        return AppTheme.statusApproved;
      case 'PARTIAL':
        return AppTheme.warning;
      case 'OVERDUE':
        return AppTheme.statusOverdue;
      case 'PENDING':
        return AppTheme.textSecondary;
      default:
        return AppTheme.textSecondary;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PAID':
        return 'Payé';
      case 'PARTIAL':
        return 'Partiel';
      case 'OVERDUE':
        return 'En retard';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails du Prêt'),
      ),
      body: Consumer<LoanProvider>(
        builder: (context, loanProvider, _) {
          final loan = loanProvider.getLoanById(widget.loanId);

          if (loan == null) {
            return const Center(child: Text('Prêt non trouvé'));
          }

          final schedule = loanProvider.schedule;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Loan Summary Card
              Card(
                color: AppTheme.primary,
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _getStatusText(loan.status),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Montant du prêt',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        Formatters.formatCurrency(loan.amount),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Taux d\'intérêt',
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${loan.interestRate.toStringAsFixed(1)}%',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Durée',
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${loan.termWeeks} semaines',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      if (loan.isActive) ...[
                        const SizedBox(height: 16),
                        LinearProgressIndicator(
                          value: loan.progressPercentage / 100,
                          backgroundColor: Colors.white24,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            AppTheme.secondary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Payé: ${Formatters.formatCurrency(loan.paidAmount)}',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                              ),
                            ),
                            Text(
                              'Reste: ${Formatters.formatCurrency(loan.remainingBalance)}',
                              style: const TextStyle(
                                color: Colors.white,
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

              const SizedBox(height: 24),

              // Payment Schedule
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Calendrier de Paiement',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Paiement hebdo: ${Formatters.formatCurrency(loan.weeklyPayment)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              if (schedule.isEmpty)
                const LoadingWidget(message: 'Chargement du calendrier...')
              else
                Card(
                  child: Column(
                    children: schedule.asMap().entries.map((entry) {
                      final index = entry.key;
                      final item = entry.value;
                      final isLast = index == schedule.length - 1;

                      return Column(
                        children: [
                          ListTile(
                            leading: CircleAvatar(
                              backgroundColor: _getStatusColor(item.status)
                                  .withOpacity(0.1),
                              child: Text(
                                '${item.weekNumber}',
                                style: TextStyle(
                                  color: _getStatusColor(item.status),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              Formatters.formatDate(item.dueDate),
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: Text(
                              _getStatusText(item.status),
                              style: TextStyle(
                                color: _getStatusColor(item.status),
                              ),
                            ),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  Formatters.formatCurrency(item.amountDue),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                if (item.amountPaid > 0)
                                  Text(
                                    'Payé: ${Formatters.formatCurrency(item.amountPaid)}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: AppTheme.secondary,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          if (!isLast) const Divider(height: 1),
                        ],
                      );
                    }).toList(),
                  ),
                ),

              const SizedBox(height: 24),

              // Make Payment Button
              if (loan.isActive)
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pushNamed(
                      Routes.makePayment,
                      arguments: loan.id,
                    );
                  },
                  icon: const Icon(Icons.payment),
                  label: const Text('Effectuer un paiement'),
                ),

              const SizedBox(height: 24),
            ],
          );
        },
      ),
    );
  }
}
