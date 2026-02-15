import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/payment.dart';
import '../../providers/loan_provider.dart';
import '../../providers/payment_provider.dart';
import '../../utils/formatters.dart';

class MakePaymentScreen extends StatefulWidget {
  final String loanId;

  const MakePaymentScreen({super.key, required this.loanId});

  @override
  State<MakePaymentScreen> createState() => _MakePaymentScreenState();
}

class _MakePaymentScreenState extends State<MakePaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _referenceController = TextEditingController();
  PaymentMethod? _selectedMethod;

  @override
  void initState() {
    super.initState();
    _loadLoan();
  }

  void _loadLoan() {
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    final loan = loanProvider.getLoanById(widget.loanId);
    if (loan != null && loan.isActive) {
      _amountController.text = loan.weeklyPayment.toStringAsFixed(0);
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _referenceController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedMethod == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner un mode de paiement'),
          backgroundColor: AppTheme.danger,
        ),
      );
      return;
    }

    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Montant invalide'),
          backgroundColor: AppTheme.danger,
        ),
      );
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmer le paiement'),
        content: Text(
          'Vous allez payer ${Formatters.formatCurrency(amount)} via ${_selectedMethod!.name}.',
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

    final paymentProvider = Provider.of<PaymentProvider>(context, listen: false);
    final success = await paymentProvider.makePayment(
      loanId: widget.loanId,
      amount: amount,
      method: _selectedMethod!.code,
      reference: _referenceController.text.isNotEmpty
          ? _referenceController.text
          : null,
    );

    if (!mounted) return;

    if (success) {
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: AppTheme.secondary, size: 32),
              SizedBox(width: 12),
              Text('Succès!'),
            ],
          ),
          content: Text(
            'Votre paiement de ${Formatters.formatCurrency(amount)} a été enregistré avec succès.',
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            paymentProvider.error ?? 'Erreur lors du paiement',
          ),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final loanProvider = Provider.of<LoanProvider>(context);
    final loan = loanProvider.getLoanById(widget.loanId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Effectuer un Paiement'),
      ),
      body: loan == null
          ? const Center(child: Text('Prêt non trouvé'))
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Loan Info
                  Card(
                    color: AppTheme.background,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Prêt',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            Formatters.formatCurrency(loan.amount),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Paiement hebdo',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      Formatters.formatCurrency(
                                        loan.weeklyPayment,
                                      ),
                                      style: const TextStyle(
                                        fontSize: 16,
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
                                      'Reste à payer',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      Formatters.formatCurrency(
                                        loan.remainingBalance,
                                      ),
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Amount Input
                  const Text(
                    'Montant à payer',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      hintText: '0',
                      suffixText: 'CFA',
                      prefixIcon: Icon(Icons.attach_money),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Montant requis';
                      }
                      final amount = double.tryParse(value);
                      if (amount == null || amount <= 0) {
                        return 'Montant invalide';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 24),

                  // Payment Method
                  const Text(
                    'Mode de paiement',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...PaymentMethod.all.map((method) {
                    final isSelected = _selectedMethod?.code == method.code;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      color: isSelected
                          ? AppTheme.primary.withOpacity(0.1)
                          : null,
                      child: ListTile(
                        leading: Text(
                          method.icon,
                          style: const TextStyle(fontSize: 24),
                        ),
                        title: Text(
                          method.name,
                          style: TextStyle(
                            fontWeight: isSelected
                                ? FontWeight.w600
                                : FontWeight.normal,
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(
                                Icons.check_circle,
                                color: AppTheme.primary,
                              )
                            : const Icon(Icons.circle_outlined),
                        onTap: () {
                          setState(() {
                            _selectedMethod = method;
                          });
                        },
                      ),
                    );
                  }),

                  const SizedBox(height: 24),

                  // Reference Number (Optional)
                  const Text(
                    'Numéro de référence (optionnel)',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _referenceController,
                    decoration: const InputDecoration(
                      hintText: 'Ex: TXN123456',
                      prefixIcon: Icon(Icons.confirmation_number),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Submit Button
                  Consumer<PaymentProvider>(
                    builder: (context, paymentProvider, _) {
                      return ElevatedButton(
                        onPressed: paymentProvider.isLoading ? null : _submit,
                        child: paymentProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : Text(
                                'Payer ${_amountController.text.isNotEmpty ? Formatters.formatCurrency(double.tryParse(_amountController.text) ?? 0) : ''}',
                              ),
                      );
                    },
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }
}
