import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color? color;
  final Color? backgroundColor;

  const StatusBadge({
    super.key,
    required this.label,
    this.color,
    this.backgroundColor,
  });

  factory StatusBadge.fromStatus(String status) {
    Color color;
    Color bgColor;

    switch (status.toUpperCase()) {
      case 'PENDING':
        color = AppColors.pending;
        bgColor = AppColors.warningLight;
      case 'APPROVED':
      case 'COMPLETED':
      case 'ACTIVE':
        color = AppColors.success;
        bgColor = AppColors.successLight;
      case 'REJECTED':
      case 'DEFAULTED':
      case 'FAILED':
        color = AppColors.error;
        bgColor = AppColors.errorLight;
      case 'DISBURSED':
      case 'PROCESSING':
        color = AppColors.info;
        bgColor = AppColors.infoLight;
      default:
        color = AppColors.textSecondary;
        bgColor = AppColors.background;
    }

    final label = _statusToFrench(status);
    return StatusBadge(label: label, color: color, backgroundColor: bgColor);
  }

  static String _statusToFrench(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      case 'ACTIVE':
        return 'Actif';
      case 'COMPLETED':
        return 'Terminé';
      case 'DISBURSED':
        return 'Décaissé';
      case 'DEFAULTED':
        return 'En défaut';
      case 'CANCELLED':
        return 'Annulé';
      case 'PROCESSING':
        return 'En cours';
      case 'FAILED':
        return 'Échoué';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.textSecondary;
    final bg = backgroundColor ?? c.withOpacity(0.1);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: c,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
