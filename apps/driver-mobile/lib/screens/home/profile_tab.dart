import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/credit_provider.dart';
import '../../utils/formatters.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final creditProvider = Provider.of<CreditProvider>(context, listen: false);
    await creditProvider.fetchCreditScore();
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Déconnexion'),
        content: const Text('Êtes-vous sûr de vouloir vous déconnecter?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.danger,
            ),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          Routes.login,
          (route) => false,
        );
      }
    }
  }

  Color _getKYCStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return AppTheme.statusPending;
      case 'APPROVED':
        return AppTheme.statusApproved;
      case 'REJECTED':
        return AppTheme.statusRejected;
      default:
        return AppTheme.textSecondary;
    }
  }

  String _getKYCStatusText(String status) {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final creditProvider = Provider.of<CreditProvider>(context);
    final user = authProvider.user;
    final creditScore = creditProvider.creditScore;

    if (user == null) {
      return const Scaffold(
        body: Center(child: Text('Utilisateur non connecté')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 48,
                    backgroundColor: AppTheme.primary,
                    child: Text(
                      user.initials,
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user.name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.email,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.phone,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: _getKYCStatusColor(user.kycStatus).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'KYC: ${_getKYCStatusText(user.kycStatus)}',
                      style: TextStyle(
                        color: _getKYCStatusColor(user.kycStatus),
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Credit Score Summary
          if (creditScore != null)
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor:
                      AppTheme.getCreditScoreColor(creditScore.score)
                          .withOpacity(0.1),
                  child: Icon(
                    Icons.star,
                    color: AppTheme.getCreditScoreColor(creditScore.score),
                  ),
                ),
                title: const Text('Score de Crédit'),
                subtitle: Text(
                  '${creditScore.score} • ${creditScore.rating}',
                ),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  Navigator.of(context).pushNamed(Routes.creditScore);
                },
              ),
            ),

          const SizedBox(height: 8),

          // Account Info
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFF3F4F6),
                    child: Icon(Icons.calendar_today, color: AppTheme.primary),
                  ),
                  title: const Text('Membre depuis'),
                  subtitle: Text(
                    Formatters.formatDate(user.createdAt),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Menu Items
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications),
                  title: const Text('Notifications'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Navigator.of(context).pushNamed(Routes.notifications);
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.verified_user),
                  title: const Text('Documents KYC'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Navigator.of(context).pushNamed(Routes.kyc);
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Logout Button
          OutlinedButton.icon(
            onPressed: _logout,
            icon: const Icon(Icons.logout),
            label: const Text('Déconnexion'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.danger,
              side: const BorderSide(color: AppTheme.danger),
            ),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
