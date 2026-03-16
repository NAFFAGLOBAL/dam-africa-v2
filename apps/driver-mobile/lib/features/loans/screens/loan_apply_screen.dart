import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/loading_overlay.dart';
import '../providers/loan_provider.dart';

class LoanApplyScreen extends ConsumerStatefulWidget {
  const LoanApplyScreen({super.key});

  @override
  ConsumerState<LoanApplyScreen> createState() => _LoanApplyScreenState();
}

class _LoanApplyScreenState extends ConsumerState<LoanApplyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _purposeController = TextEditingController();
  int _selectedTerm = 12;
  final List<int> _termOptions = [3, 6, 9, 12, 18, 24];

  @override
  void dispose() {
    _amountController.dispose();
    _purposeController.dispose();
    super.dispose();
  }

  double get _enteredAmount {
    final text = _amountController.text.replaceAll(RegExp(r'[^\d]'), '');
    return double.tryParse(text) ?? 0;
  }

  Future<void> _handleApply() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref.read(loanApplicationProvider.notifier).apply(
          amount: _enteredAmount,
          termMonths: _selectedTerm,
          purpose: _purposeController.text.trim().isNotEmpty
              ? _purposeController.text.trim()
              : null,
        );

    if (success && mounted) {
      ref.invalidate(myLoansProvider);
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Demande soumise'),
          content: const Text(
            'Votre demande de prêt a été soumise avec succès. '
            'Vous serez notifié dès qu\'elle sera traitée.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                context.go('/loans');
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final eligibilityAsync = ref.watch(loanEligibilityProvider);
    final applicationState = ref.watch(loanApplicationProvider);

    ref.listen(loanApplicationProvider, (prev, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: AppColors.error,
          ),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Demander un prêt'),
      ),
      body: LoadingOverlay(
        isLoading: applicationState.isLoading,
        message: 'Soumission en cours...',
        child: eligibilityAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                  const SizedBox(height: 16),
                  Text(
                    '$error',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
          ),
          data: (eligibility) {
            if (!eligibility.eligible) {
              return _IneligibleView(
                reason: eligibility.reason ?? 'Vous n\'êtes pas éligible pour le moment',
              );
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Eligibility Info Card
                    Card(
                      color: AppColors.successLight,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, color: AppColors.success),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Vous êtes éligible',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.success,
                                    ),
                                  ),
                                  Text(
                                    'Montant max: ${Formatters.currency(eligibility.maxAmount)} '
                                    '| Taux: ${Formatters.interestRate(eligibility.interestRate)}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Amount
                    TextFormField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      validator: (v) {
                        final error = Validators.amount(v);
                        if (error != null) return error;
                        if (_enteredAmount > eligibility.maxAmount) {
                          return 'Maximum: ${Formatters.currency(eligibility.maxAmount)}';
                        }
                        return null;
                      },
                      decoration: InputDecoration(
                        labelText: 'Montant du prêt (FCFA)',
                        hintText: 'Ex: 500000',
                        prefixIcon: const Icon(Icons.monetization_on_outlined),
                        helperText:
                            'Maximum: ${Formatters.currency(eligibility.maxAmount)}',
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Term Selection
                    const Text(
                      'Durée du prêt',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _termOptions.map((term) {
                        final isSelected = _selectedTerm == term;
                        return ChoiceChip(
                          label: Text('$term mois'),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) setState(() => _selectedTerm = term);
                          },
                          selectedColor: AppColors.primary.withOpacity(0.15),
                          labelStyle: TextStyle(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.textSecondary,
                            fontWeight:
                                isSelected ? FontWeight.w600 : FontWeight.normal,
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 20),

                    // Purpose
                    TextFormField(
                      controller: _purposeController,
                      textCapitalization: TextCapitalization.sentences,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: 'Objet du prêt (optionnel)',
                        hintText: 'Ex: Achat de véhicule',
                        prefixIcon: Icon(Icons.description_outlined),
                        alignLabelWithHint: true,
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Estimation Card
                    if (_enteredAmount > 0)
                      _EstimationCard(
                        amount: _enteredAmount,
                        termMonths: _selectedTerm,
                        interestRate: eligibility.interestRate,
                      ),

                    const SizedBox(height: 24),

                    // Submit
                    ElevatedButton(
                      onPressed:
                          applicationState.isLoading ? null : _handleApply,
                      child: const Text('Soumettre la demande'),
                    ),

                    const SizedBox(height: 32),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _IneligibleView extends StatelessWidget {
  final String reason;

  const _IneligibleView({required this.reason});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.warningLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.block,
                size: 40,
                color: AppColors.warning,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Non éligible',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              reason,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => context.pop(),
              child: const Text('Retour'),
            ),
          ],
        ),
      ),
    );
  }
}

class _EstimationCard extends StatelessWidget {
  final double amount;
  final int termMonths;
  final double interestRate;

  const _EstimationCard({
    required this.amount,
    required this.termMonths,
    required this.interestRate,
  });

  @override
  Widget build(BuildContext context) {
    final r = interestRate / 100 / 12;
    final n = termMonths;
    final monthly = r > 0
        ? amount * r * _pow(1 + r, n) / (_pow(1 + r, n) - 1)
        : amount / n;
    final total = monthly * n;

    return Card(
      color: AppColors.infoLight,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Estimation',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.info,
              ),
            ),
            const SizedBox(height: 12),
            _EstRow('Mensualité estimée', Formatters.currency(monthly)),
            _EstRow('Total à rembourser', Formatters.currency(total)),
            _EstRow('Coût du crédit', Formatters.currency(total - amount)),
          ],
        ),
      ),
    );
  }

  double _pow(double base, int exp) {
    double result = 1;
    for (int i = 0; i < exp; i++) {
      result *= base;
    }
    return result;
  }
}

class _EstRow extends StatelessWidget {
  final String label;
  final String value;

  const _EstRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
