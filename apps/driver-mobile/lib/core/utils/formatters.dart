import 'package:intl/intl.dart';

class Formatters {
  static final _currencyFormat = NumberFormat('#,###', 'fr_FR');
  static final _dateFormat = DateFormat('dd/MM/yyyy', 'fr_FR');
  static final _dateTimeFormat = DateFormat('dd/MM/yyyy HH:mm', 'fr_FR');

  static String currency(double amount) {
    return '${_currencyFormat.format(amount.round())} FCFA';
  }

  static String compactCurrency(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M FCFA';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(0)}K FCFA';
    }
    return currency(amount);
  }

  static String date(String? dateStr) {
    if (dateStr == null) return '-';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;
    return _dateFormat.format(date.toLocal());
  }

  static String dateTime(String? dateStr) {
    if (dateStr == null) return '-';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;
    return _dateTimeFormat.format(date.toLocal());
  }

  static String relativeDate(String? dateStr) {
    if (dateStr == null) return '-';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;

    final now = DateTime.now();
    final diff = now.difference(date.toLocal());

    if (diff.inMinutes < 1) return 'À l\'instant';
    if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'Il y a ${diff.inHours}h';
    if (diff.inDays < 7) return 'Il y a ${diff.inDays}j';
    return _dateFormat.format(date.toLocal());
  }

  static String phone(String phone) {
    // Format Côte d'Ivoire phone: +225 XX XX XX XX XX
    final cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    if (cleaned.length == 10) {
      return '+225 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}';
    }
    return phone;
  }

  static String percent(double value) {
    return '${(value * 100).toStringAsFixed(1)}%';
  }

  static String interestRate(double rate) {
    return '${rate.toStringAsFixed(1)}%';
  }
}
