import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/loan_provider.dart';
import '../../utils/formatters.dart';

class LoanApplyScreen extends StatefulWidget {
  const LoanApplyScreen({super.key});

  @override
  State<LoanApplyScreen> createState() => _LoanApplyScreenState();
}

class _LoanApplyScreenState extends State<LoanApplyScreen> {
  double _amount = 100000;
  int _termWeeks = 8;
  String? _purpose;

  final _purposes = [
    'Achat véhicule',
    'Réparation',
    'Carburant',
    'Assurance',
    'Autre',
  ];

  @override
  void initState() {
    super.initState();
    _loadEligibility();
  }

  Future<void> _loadEligibility() async {
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    await loanProvider.checkEligibility();
    if (mounted) {
      final eligibility = loanProvider.eligibility;
      if (eligibility != null && eligibility.maxAmount != null) {
        setState(() {
          _amount = (eligibility.maxAmount! / 2).clamp(50000, eligibility.maxAmount!);
        });
      }
      _calculateLoan();
    }
  }

  Future<void> _calculateLoan() async {
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    await loanProvider.calculateLoan(_amount, _termWeeks);
  }

  Future<void> _submit() async {
    if (_purpose == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner l\'objectif du prêt'),
          backgroundColor: AppTheme.danger,
        ),
      );
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmer la demande'),
        content: Text(
          'Vous demandez ${Formatters.formatCurrency(_amount)} pour $_termWeeks semaines.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Confirmer'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    final success = await loanProvider.applyForLoan(
      amount: _amount,
      termWeeks: _termWeeks,
      purpose: _purpose,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Demande de prêt soumise avec succès!'),
          backgroundColor: AppTheme.secondary,
        ),
      );
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            loanProvider.error ?? 'Erreur lors de la demande',
          ),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final loanProvider = Provider.of<LoanProvider>(context);
    final eligibility = loanProvider.eligibility;
    final calculation = loanProvider.calculation;

    final maxAmount = eligibility?.maxAmount ?? 2000000;
    final minAmount = 50000.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Demander un Prêt'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Amount Slider
          const Text(
            'Montant du prêt',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(
                    Formatters.formatCurrency(_amount),
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primary,
                    ),
                  ),
                  Slider(
                    value: _amount,
                    min: minAmount,
                    max: maxAmount,
                    divisions: ((maxAmount - minAmount) / 10000).round(),
                    label: Formatters.formatCurrency(_amount),
                    onChanged: (value) {
                      setState(() {
                        _amount = value;
                      });
                    },
                    onChangeEnd: (value) {
                      _calculateLoan();
                    },
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        Formatters.formatCurrency(minAmount),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        Formatters.formatCurrency(maxAmount),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Term Selector
          const Text(
            'Durée du prêt',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [4, 8, 12, 16, 24].map((weeks) {
              final isSelected = _termWeeks == weeks;
              return ChoiceChip(
                label: Text('$weeks semaines'),
                selected: isSelected,
                onSelected: (selected) {
                  setState(() {
                    _termWeeks = weeks;
                  });
                  _calculateLoan();
                },
                selectedColor: AppTheme.primary,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppTheme.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 24),

          // Calculation Results
          if (calculation != null)
            Card(
              color: AppTheme.background,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Détails du prêt',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _DetailRow(
                      label: 'Montant demandé',
                      value: Formatters.formatCurrency(calculation.amount),
                    ),
                    const SizedBox(height: 8),
                    _DetailRow(
                      label: 'Taux d\'intérêt',
                      value: '${calculation.interestRate.toStringAsFixed(1)}%',
                    ),
                    const SizedBox(height: 8),
                    _DetailRow(
                      label: 'Paiement hebdomadaire',
                      value: Formatters.formatCurrency(
                        calculation.weeklyPayment,
                      ),
                      highlight: true,
                    ),
                    const SizedBox(height: 8),
                    _DetailRow(
                      label: 'Total à rembourser',
                      value: Formatters.formatCurrency(
                        calculation.totalRepayment,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _DetailRow(
                      label: 'Intérêts totaux',
                      value: Formatters.formatCurrency(
                        calculation.totalInterest,
                      ),
                      valueColor: AppTheme.textSecondary,
                    ),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 24),

          // Purpose Selector
          const Text(
            'Objectif du prêt',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: _purposes.asMap().entries.map((entry) {
                final index = entry.key;
                final purpose = entry.value;
                final isLast = index == _purposes.length - 1;

                return Column(
                  children: [
                    RadioListTile<String>(
                      title: Text(purpose),
                      value: purpose,
                      groupValue: _purpose,
                      onChanged: (value) {
                        setState(() {
                          _purpose = value;
                        });
                      },
                    ),
                    if (!isLast) const Divider(height: 1),
                  ],
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 32),

          // Submit Button
          ElevatedButton(
            onPressed: loanProvider.isLoading ? null : _submit,
            child: loanProvider.isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text('Soumettre la demande'),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool highlight;
  final Color? valueColor;

  const _DetailRow({
    required this.label,
    required this.value,
    this.highlight = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: highlight ? 16 : 14,
            color: AppTheme.textSecondary,
            fontWeight: highlight ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: highlight ? 18 : 14,
            fontWeight: highlight ? FontWeight.bold : FontWeight.w600,
            color: valueColor ?? AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }
}
