class Payment {
  final String id;
  final String userId;
  final String? loanId;
  final String? rentalId;
  final String? contractId;
  final double amount;
  final String currency;
  final String method;
  final String status;
  final String reference;
  final String? phone;
  final String? description;
  final String? paidAt;
  final String? failureReason;
  final String createdAt;

  Payment({
    required this.id,
    required this.userId,
    this.loanId,
    this.rentalId,
    this.contractId,
    required this.amount,
    required this.currency,
    required this.method,
    required this.status,
    required this.reference,
    this.phone,
    this.description,
    this.paidAt,
    this.failureReason,
    required this.createdAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      userId: json['userId'] as String,
      loanId: json['loanId'] as String?,
      rentalId: json['rentalId'] as String?,
      contractId: json['contractId'] as String?,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'XOF',
      method: json['method'] as String,
      status: json['status'] as String,
      reference: json['reference'] as String,
      phone: json['phone'] as String?,
      description: json['description'] as String?,
      paidAt: json['paidAt'] as String?,
      failureReason: json['failureReason'] as String?,
      createdAt: json['createdAt'] as String,
    );
  }

  String get methodLabel {
    switch (method) {
      case 'WAVE':
        return 'Wave';
      case 'MOBILE_MONEY':
        return 'Mobile Money';
      case 'BANK_TRANSFER':
        return 'Virement bancaire';
      case 'CASH':
        return 'Espèces';
      default:
        return method;
    }
  }

  String get statusLabel {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'PROCESSING':
        return 'En cours';
      case 'COMPLETED':
        return 'Complété';
      case 'FAILED':
        return 'Échoué';
      case 'REFUNDED':
        return 'Remboursé';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  }

  bool get isCompleted => status == 'COMPLETED';
  bool get isPending => status == 'PENDING';
}
