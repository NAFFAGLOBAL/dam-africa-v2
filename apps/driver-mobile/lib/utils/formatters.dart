import 'package:intl/intl.dart';

class Formatters {
  static String formatCurrency(double amount) {
    final formatter = NumberFormat('#,##0', 'fr_FR');
    return '${formatter.format(amount)} CFA';
  }

  static String formatDate(DateTime date) {
    final formatter = DateFormat('d MMM yyyy', 'fr_FR');
    return formatter.format(date);
  }

  static String formatDateTime(DateTime date) {
    final formatter = DateFormat('d MMM yyyy HH:mm', 'fr_FR');
    return formatter.format(date);
  }

  static String formatShortDate(DateTime date) {
    final formatter = DateFormat('d MMM', 'fr_FR');
    return formatter.format(date);
  }

  static String timeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 365) {
      final years = (difference.inDays / 365).floor();
      return 'Il y a $years ${years == 1 ? 'an' : 'ans'}';
    } else if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return 'Il y a $months mois';
    } else if (difference.inDays > 0) {
      return 'Il y a ${difference.inDays} ${difference.inDays == 1 ? 'jour' : 'jours'}';
    } else if (difference.inHours > 0) {
      return 'Il y a ${difference.inHours} ${difference.inHours == 1 ? 'heure' : 'heures'}';
    } else if (difference.inMinutes > 0) {
      return 'Il y a ${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'}';
    } else {
      return 'À l\'instant';
    }
  }
}
