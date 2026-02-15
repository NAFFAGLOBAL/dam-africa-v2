class Payment {
  final String id;
  final String loanId;
  final String userId;
  final double amount;
  final String method;
  final String status;
  final String? reference;
  final String? externalId;
  final DateTime createdAt;
  final DateTime? processedAt;

  Payment({
    required this.id,
    required this.loanId,
    required this.userId,
    required this.amount,
    required this.method,
    required this.status,
    this.reference,
    this.externalId,
    required this.createdAt,
    this.processedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      loanId: json['loanId'] as String,
      userId: json['userId'] as String,
      amount: (json['amount'] as num).toDouble(),
      method: json['method'] as String,
      status: json['status'] as String,
      reference: json['reference'] as String?,
      externalId: json['externalId'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      processedAt: json['processedAt'] != null
          ? DateTime.parse(json['processedAt'] as String)
          : null,
    );
  }

  bool get isCompleted => status == 'COMPLETED';
  bool get isPending => status == 'PENDING';
  bool get isFailed => status == 'FAILED';
}

class PaymentMethod {
  final String code;
  final String name;
  final String icon;

  PaymentMethod({
    required this.code,
    required this.name,
    required this.icon,
  });

  static List<PaymentMethod> get all => [
        PaymentMethod(code: 'WAVE', name: 'Wave', icon: '📱'),
        PaymentMethod(code: 'ORANGE_MONEY', name: 'Orange Money', icon: '🟠'),
        PaymentMethod(code: 'MTN_MONEY', name: 'MTN Mobile Money', icon: '💛'),
      ];
}
