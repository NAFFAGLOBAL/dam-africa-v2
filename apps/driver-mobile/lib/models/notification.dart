class AppNotification {
  final String id;
  final String userId;
  final String type;
  final String title;
  final String message;
  final bool isRead;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.message,
    required this.isRead,
    this.metadata,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      userId: json['userId'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      isRead: json['isRead'] as bool? ?? false,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  String get icon {
    switch (type) {
      case 'LOAN_APPROVED':
        return '✅';
      case 'LOAN_REJECTED':
        return '❌';
      case 'PAYMENT_DUE':
        return '⏰';
      case 'PAYMENT_RECEIVED':
        return '💰';
      case 'PAYMENT_OVERDUE':
        return '⚠️';
      case 'KYC_APPROVED':
        return '✅';
      case 'KYC_REJECTED':
        return '❌';
      case 'CREDIT_SCORE_UPDATED':
        return '📊';
      default:
        return 'ℹ️';
    }
  }
}

class NotificationCount {
  final int unreadCount;

  NotificationCount({required this.unreadCount});

  factory NotificationCount.fromJson(Map<String, dynamic> json) {
    return NotificationCount(
      unreadCount: json['unreadCount'] as int? ?? 0,
    );
  }
}
