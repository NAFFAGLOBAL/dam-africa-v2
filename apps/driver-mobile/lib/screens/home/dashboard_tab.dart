import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/credit_provider.dart';
import '../../providers/loan_provider.dart';
import '../../providers/payment_provider.dart';
import '../../utils/formatters.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/loan_card.dart';
import '../../widgets/payment_card.dart';
import '../../widgets/score_gauge.dart';
import '../../widgets/stat_card.dart';

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final creditProvider = Provider.of<CreditProvider>(context, listen: false);
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    final paymentProvider = Provider.of<PaymentProvider>(context, listen: false);

    await Future.wait([
      creditProvider.fetchCreditScore(),
      loanProvider.fetchLoans(),
      paymentProvider.fetchPayments(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bonjour, ${user?.name.split(' ').first ?? ''}!',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            Text(
              Formatters.formatDate(DateTime.now()),
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              Navigator.of(context).pushNamed(Routes.notifications);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: Consumer3<CreditProvider, LoanProvider, PaymentProvider>(
          builder: (context, creditProvider, loanProvider, paymentProvider, _) {
            if (creditProvider.isLoading ||
                loanProvider.isLoading ||
                paymentProvider.isLoading) {
              return const LoadingWidget(message: 'Chargement...');
            }

            final creditScore = creditProvider.creditScore;
            final activeLoan = loanProvider.currentActiveLoan;
            final recentPayments = paymentProvider.payments.take(3).toList();

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Credit Score Card
                if (creditScore != null)
                  Card(
                    child: InkWell(
                      onTap: () {
                        Navigator.of(context).pushNamed(Routes.creditScore);
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            ScoreGauge(
                              score: creditScore.score,
                              rating: creditScore.rating,
                              size: 180,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              creditScore.ratingDescription,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextButton.icon(
                              onPressed: () {
                                Navigator.of(context).pushNamed(Routes.creditScore);
                              },
                              icon: const Icon(Icons.arrow_forward, size: 16),
                              label: const Text('Voir les détails'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                const SizedBox(height: 16),

                // Quick Stats
                Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        title: 'Prêt Actif',
                        value: activeLoan != null
                            ? Formatters.formatCurrency(activeLoan.amount)
                            : 'Aucun',
                        icon: Icons.account_balance_wallet,
                        color: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatCard(
                        title: 'Prochain Paiement',
                        value: activeLoan != null
                            ? Formatters.formatCurrency(activeLoan.weeklyPayment)
                            : '—',
                        icon: Icons.calendar_today,
                        color: AppTheme.warning,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Active Loan Card
                if (activeLoan != null) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Prêt Actif',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pushNamed(
                            Routes.loanDetail,
                            arguments: activeLoan.id,
                          );
                        },
                        child: const Text('Détails'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Card(
                    color: AppTheme.primary,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Montant emprunté',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                Formatters.formatCurrency(activeLoan.amount),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Reste à payer',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                Formatters.formatCurrency(activeLoan.remainingBalance),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          LinearProgressIndicator(
                            value: activeLoan.progressPercentage / 100,
                            backgroundColor: Colors.white24,
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              AppTheme.secondary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${activeLoan.progressPercentage.toStringAsFixed(0)}% payé',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.of(context).pushNamed(
                                  Routes.makePayment,
                                  arguments: activeLoan.id,
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppTheme.primary,
                              ),
                              icon: const Icon(Icons.payment),
                              label: const Text('Effectuer un paiement'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Recent Payments
                if (recentPayments.isNotEmpty) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Paiements Récents',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          // Switch to payments tab
                        },
                        child: const Text('Voir tout'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...recentPayments.map((payment) => PaymentCard(
                        payment: payment,
                        onTap: () {},
                      )),
                ],

                // Empty state
                if (activeLoan == null && recentPayments.isEmpty) ...[
                  const SizedBox(height: 48),
                  Center(
                    child: Column(
                      children: [
                        const Icon(
                          Icons.account_balance_wallet_outlined,
                          size: 80,
                          color: AppTheme.textSecondary,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Aucun prêt actif',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Demandez un prêt pour commencer',
                          style: TextStyle(
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).pushNamed(Routes.loanApply);
                          },
                          icon: const Icon(Icons.add),
                          label: const Text('Demander un prêt'),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 24),
              ],
            );
          },
        ),
      ),
    );
  }
}
