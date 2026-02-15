import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/payment_provider.dart';
import '../../widgets/common/empty_state_widget.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/payment_card.dart';

class PaymentsTab extends StatefulWidget {
  const PaymentsTab({super.key});

  @override
  State<PaymentsTab> createState() => _PaymentsTabState();
}

class _PaymentsTabState extends State<PaymentsTab> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final paymentProvider = Provider.of<PaymentProvider>(context, listen: false);
    await paymentProvider.fetchPayments();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Paiements'),
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: Consumer<PaymentProvider>(
          builder: (context, paymentProvider, _) {
            if (paymentProvider.isLoading) {
              return const LoadingWidget(message: 'Chargement des paiements...');
            }

            final payments = paymentProvider.payments;

            if (payments.isEmpty) {
              return const EmptyStateWidget(
                icon: Icons.payment,
                title: 'Aucun paiement',
                message: 'Vous n\'avez effectué aucun paiement.',
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: payments.length,
              itemBuilder: (context, index) {
                final payment = payments[index];
                return PaymentCard(
                  payment: payment,
                  onTap: () {},
                );
              },
            );
          },
        ),
      ),
    );
  }
}
