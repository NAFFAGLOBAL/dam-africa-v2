import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/credit_score.dart';
import '../../providers/credit_provider.dart';
import '../../utils/formatters.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/score_gauge.dart';

class CreditScoreScreen extends StatefulWidget {
  const CreditScoreScreen({super.key});

  @override
  State<CreditScoreScreen> createState() => _CreditScoreScreenState();
}

class _CreditScoreScreenState extends State<CreditScoreScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final creditProvider = Provider.of<CreditProvider>(context, listen: false);
    await Future.wait([
      creditProvider.fetchCreditScore(),
      creditProvider.fetchCreditHistory(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Score de Crédit'),
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: Consumer<CreditProvider>(
          builder: (context, creditProvider, _) {
            if (creditProvider.isLoading) {
              return const LoadingWidget(message: 'Chargement du score...');
            }

            final creditScore = creditProvider.creditScore;
            final history = creditProvider.history;

            if (creditScore == null) {
              return const Center(child: Text('Aucun score disponible'));
            }

            final components = ScoreComponent.getComponents(creditScore);

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Score Gauge
                Center(
                  child: ScoreGauge(
                    score: creditScore.score,
                    rating: creditScore.rating,
                    size: 220,
                  ),
                ),

                const SizedBox(height: 24),

                // Rating Description
                Card(
                  color: AppTheme.getCreditScoreColor(creditScore.score)
                      .withOpacity(0.1),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      creditScore.ratingDescription,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.getCreditScoreColor(creditScore.score),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Components Breakdown
                const Text(
                  'Détails du Score',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: components.asMap().entries.map((entry) {
                        final index = entry.key;
                        final component = entry.value;
                        final isLast = index == components.length - 1;

                        return Column(
                          children: [
                            _ComponentItem(component: component),
                            if (!isLast) ...[
                              const SizedBox(height: 16),
                              const Divider(height: 1),
                              const SizedBox(height: 16),
                            ],
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Tips to Improve
                const Text(
                  'Conseils pour améliorer votre score',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _TipItem(
                          icon: Icons.check_circle,
                          text: 'Payez vos échéances à temps',
                        ),
                        SizedBox(height: 12),
                        _TipItem(
                          icon: Icons.money_off,
                          text: 'Évitez d\'emprunter trop souvent',
                        ),
                        SizedBox(height: 12),
                        _TipItem(
                          icon: Icons.verified,
                          text: 'Complétez votre vérification KYC',
                        ),
                        SizedBox(height: 12),
                        _TipItem(
                          icon: Icons.trending_up,
                          text: 'Maintenez une bonne conduite',
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Score History
                if (history.isNotEmpty) ...[
                  const Text(
                    'Historique du Score',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Column(
                      children: history.asMap().entries.map((entry) {
                        final index = entry.key;
                        final item = entry.value;
                        final isLast = index == history.length - 1;

                        return Column(
                          children: [
                            ListTile(
                              leading: CircleAvatar(
                                backgroundColor: AppTheme.getCreditScoreColor(
                                  item.score,
                                ).withOpacity(0.1),
                                child: Text(
                                  item.rating,
                                  style: TextStyle(
                                    color: AppTheme.getCreditScoreColor(
                                      item.score,
                                    ),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              title: Text(
                                item.score.toString(),
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              subtitle: Text(
                                Formatters.formatDate(item.createdAt),
                              ),
                            ),
                            if (!isLast) const Divider(height: 1),
                          ],
                        );
                      }).toList(),
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

class _ComponentItem extends StatelessWidget {
  final ScoreComponent component;

  const _ComponentItem({required this.component});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                component.name,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Text(
              '${component.weight.toInt()}%',
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          component.description,
          style: const TextStyle(
            fontSize: 12,
            color: AppTheme.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: component.score / 100,
            minHeight: 8,
            backgroundColor: AppTheme.border,
            valueColor: AlwaysStoppedAnimation<Color>(
              component.score >= 70
                  ? AppTheme.secondary
                  : component.score >= 40
                      ? AppTheme.warning
                      : AppTheme.danger,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '${component.score.toStringAsFixed(0)}/100',
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _TipItem extends StatelessWidget {
  final IconData icon;
  final String text;

  const _TipItem({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: AppTheme.secondary,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 14),
          ),
        ),
      ],
    );
  }
}
