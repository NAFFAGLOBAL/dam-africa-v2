import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/loading_overlay.dart';
import '../providers/payment_provider.dart';

class PaymentCreateScreen extends ConsumerStatefulWidget {
  final String? loanId;

  const PaymentCreateScreen({super.key, this.loanId});

  @override
  ConsumerState<PaymentCreateScreen> createState() =>
      _PaymentCreateScreenState();
}

class _PaymentCreateScreenState extends ConsumerState<PaymentCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedMethod = 'WAVE';

  final _methods = [
    {'value': 'WAVE', 'label': 'Wave', 'icon': Icons.waves},
    {'value': 'MOBILE_MONEY', 'label': 'Mobile Money', 'icon': Icons.phone_android},
    {'value': 'BANK_TRANSFER', 'label': 'Virement bancaire', 'icon': Icons.account_balance},
  ];

  @override
  void dispose() {
    _amountController.dispose();
    _phoneController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = double.parse(
      _amountController.text.replaceAll(RegExp(r'[^\d]'), ''),
    );

    final success = await ref.read(paymentCreateProvider.notifier).createPayment(
          loanId: widget.loanId,
          amount: amount,
          method: _selectedMethod,
          phone: _phoneController.text.trim().isNotEmpty
              ? _phoneController.text.trim()
              : null,
          description: _descriptionController.text.trim().isNotEmpty
              ? _descriptionController.text.trim()
              : null,
        );

    if (success && mounted) {
      ref.invalidate(paymentHistoryProvider);
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          icon: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
          title: const Text('Paiement initié'),
          content: Text(
            'Votre paiement de ${Formatters.currency(amount)} '
            'a été enregistré et sera traité sous peu.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                context.pop();
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
    final createState = ref.watch(paymentCreateProvider);

    ref.listen(paymentCreateProvider, (prev, next) {
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
        title: const Text('Nouveau paiement'),
      ),
      body: LoadingOverlay(
        isLoading: createState.isLoading,
        message: 'Traitement...',
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (widget.loanId != null)
                  Card(
                    color: AppColors.infoLight,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline, color: AppColors.info, size: 20),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Text(
                              'Paiement lié à votre prêt actif',
                              style: TextStyle(fontSize: 13, color: AppColors.info),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                const SizedBox(height: 20),

                // Payment Method
                const Text(
                  'Moyen de paiement',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                ..._methods.map((m) {
                  final isSelected = _selectedMethod == m['value'];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: InkWell(
                      onTap: () => setState(() => _selectedMethod = m['value'] as String),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.divider,
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          color: isSelected
                              ? AppColors.primary.withOpacity(0.05)
                              : AppColors.white,
                        ),
                        child: Row(
                          children: [
                            Icon(
                              m['icon'] as IconData,
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              m['label'] as String,
                              style: TextStyle(
                                fontWeight:
                                    isSelected ? FontWeight.w600 : FontWeight.normal,
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.textPrimary,
                              ),
                            ),
                            const Spacer(),
                            if (isSelected)
                              const Icon(Icons.check_circle, color: AppColors.primary),
                          ],
                        ),
                      ),
                    ),
                  );
                }),

                const SizedBox(height: 16),

                // Amount
                TextFormField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  validator: Validators.amount,
                  decoration: const InputDecoration(
                    labelText: 'Montant (FCFA)',
                    hintText: 'Ex: 50000',
                    prefixIcon: Icon(Icons.monetization_on_outlined),
                  ),
                ),

                const SizedBox(height: 16),

                // Phone (for mobile payments)
                if (_selectedMethod == 'WAVE' || _selectedMethod == 'MOBILE_MONEY')
                  TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    validator: Validators.phone,
                    decoration: const InputDecoration(
                      labelText: 'Numéro de téléphone',
                      hintText: '07 XX XX XX XX',
                      prefixIcon: Icon(Icons.phone_outlined),
                      prefixText: '+225 ',
                    ),
                  ),

                const SizedBox(height: 16),

                // Description
                TextFormField(
                  controller: _descriptionController,
                  textCapitalization: TextCapitalization.sentences,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Description (optionnel)',
                    hintText: 'Ex: Paiement mensualité mars',
                    prefixIcon: Icon(Icons.description_outlined),
                    alignLabelWithHint: true,
                  ),
                ),

                const SizedBox(height: 32),

                ElevatedButton(
                  onPressed: createState.isLoading ? null : _handleSubmit,
                  child: const Text('Confirmer le paiement'),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
