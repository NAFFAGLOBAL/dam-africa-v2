import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../providers/loan_provider.dart';
import '../../widgets/common/empty_state_widget.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/loan_card.dart';

class LoansTab extends StatefulWidget {
  const LoansTab({super.key});

  @override
  State<LoansTab> createState() => _LoansTabState();
}

class _LoansTabState extends State<LoansTab> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    await Future.wait([
      loanProvider.fetchLoans(),
      loanProvider.checkEligibility(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes Prêts'),
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: Consumer<LoanProvider>(
          builder: (context, loanProvider, _) {
            if (loanProvider.isLoading) {
              return const LoadingWidget(message: 'Chargement des prêts...');
            }

            final eligibility = loanProvider.eligibility;
            final activeLoans = loanProvider.activeLoans;
            final pastLoans = loanProvider.pastLoans;

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Eligibility Banner
                if (eligibility != null)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: eligibility.isEligible
                          ? AppTheme.secondary.withOpacity(0.1)
                          : AppTheme.danger.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: eligibility.isEligible
                            ? AppTheme.secondary
                            : AppTheme.danger,
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          eligibility.isEligible
                              ? Icons.check_circle
                              : Icons.cancel,
                          color: eligibility.isEligible
                              ? AppTheme.secondary
                              : AppTheme.danger,
                          size: 32,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                eligibility.isEligible
                                    ? 'Vous êtes éligible!'
                                    : 'Non éligible',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: eligibility.isEligible
                                      ? AppTheme.secondary
                                      : AppTheme.danger,
                                ),
                              ),
                              if (eligibility.reason != null)
                                Text(
                                  eligibility.reason!,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 16),

                // Apply for Loan Button
                if (eligibility?.isEligible == true)
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pushNamed(Routes.loanApply);
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Demander un prêt'),
                  ),

                const SizedBox(height: 24),

                // Active Loans
                if (activeLoans.isNotEmpty) ...[
                  const Text(
                    'Prêts Actifs',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...activeLoans.map((loan) => LoanCard(
                        loan: loan,
                        onTap: () {
                          Navigator.of(context).pushNamed(
                            Routes.loanDetail,
                            arguments: loan.id,
                          );
                        },
                      )),
                  const SizedBox(height: 24),
                ],

                // Past Loans
                if (pastLoans.isNotEmpty) ...[
                  const Text(
                    'Historique',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...pastLoans.map((loan) => LoanCard(
                        loan: loan,
                        onTap: () {
                          Navigator.of(context).pushNamed(
                            Routes.loanDetail,
                            arguments: loan.id,
                          );
                        },
                      )),
                ],

                // Empty State
                if (activeLoans.isEmpty && pastLoans.isEmpty)
                  EmptyStateWidget(
                    icon: Icons.account_balance_wallet_outlined,
                    title: 'Aucun prêt',
                    message: 'Vous n\'avez pas encore de prêt.',
                    action: eligibility?.isEligible == true
                        ? ElevatedButton.icon(
                            onPressed: () {
                              Navigator.of(context).pushNamed(Routes.loanApply);
                            },
                            icon: const Icon(Icons.add),
                            label: const Text('Demander un prêt'),
                          )
                        : null,
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}
