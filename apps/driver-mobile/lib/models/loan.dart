class Loan {
  final String id;
  final String userId;
  final double amount;
  final double interestRate;
  final int termWeeks;
  final String status;
  final String? purpose;
  final double weeklyPayment;
  final double totalRepayment;
  final double paidAmount;
  final double remainingBalance;
  final DateTime? approvedAt;
  final DateTime? disbursedAt;
  final DateTime? completedAt;
  final DateTime createdAt;

  Loan({
    required this.id,
    required this.userId,
    required this.amount,
    required this.interestRate,
    required this.termWeeks,
    required this.status,
    this.purpose,
    required this.weeklyPayment,
    required this.totalRepayment,
    required this.paidAmount,
    required this.remainingBalance,
    this.approvedAt,
    this.disbursedAt,
    this.completedAt,
    required this.createdAt,
  });

  factory Loan.fromJson(Map<String, dynamic> json) {
    return Loan(
      id: json['id'] as String,
      userId: json['userId'] as String,
      amount: (json['amount'] as num).toDouble(),
      interestRate: (json['interestRate'] as num).toDouble(),
      termWeeks: json['termWeeks'] as int,
      status: json['status'] as String,
      purpose: json['purpose'] as String?,
      weeklyPayment: (json['weeklyPayment'] as num).toDouble(),
      totalRepayment: (json['totalRepayment'] as num).toDouble(),
      paidAmount: (json['paidAmount'] as num?)?.toDouble() ?? 0.0,
      remainingBalance: (json['remainingBalance'] as num?)?.toDouble() ?? 0.0,
      approvedAt: json['approvedAt'] != null
          ? DateTime.parse(json['approvedAt'] as String)
          : null,
      disbursedAt: json['disbursedAt'] != null
          ? DateTime.parse(json['disbursedAt'] as String)
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  double get progressPercentage {
    if (totalRepayment == 0) return 0;
    return (paidAmount / totalRepayment * 100).clamp(0, 100);
  }

  bool get isActive => status == 'ACTIVE';
  bool get isPending => status == 'PENDING';
  bool get isCompleted => status == 'COMPLETED';
  bool get isRejected => status == 'REJECTED';
}

class LoanEligibility {
  final bool isEligible;
  final String? reason;
  final double? maxAmount;
  final int? maxTermWeeks;

  LoanEligibility({
    required this.isEligible,
    this.reason,
    this.maxAmount,
    this.maxTermWeeks,
  });

  factory LoanEligibility.fromJson(Map<String, dynamic> json) {
    return LoanEligibility(
      isEligible: json['isEligible'] as bool,
      reason: json['reason'] as String?,
      maxAmount: (json['maxAmount'] as num?)?.toDouble(),
      maxTermWeeks: json['maxTermWeeks'] as int?,
    );
  }
}

class LoanCalculation {
  final double amount;
  final int termWeeks;
  final double interestRate;
  final double weeklyPayment;
  final double totalRepayment;
  final double totalInterest;

  LoanCalculation({
    required this.amount,
    required this.termWeeks,
    required this.interestRate,
    required this.weeklyPayment,
    required this.totalRepayment,
    required this.totalInterest,
  });

  factory LoanCalculation.fromJson(Map<String, dynamic> json) {
    return LoanCalculation(
      amount: (json['amount'] as num).toDouble(),
      termWeeks: json['termWeeks'] as int,
      interestRate: (json['interestRate'] as num).toDouble(),
      weeklyPayment: (json['weeklyPayment'] as num).toDouble(),
      totalRepayment: (json['totalRepayment'] as num).toDouble(),
      totalInterest: (json['totalInterest'] as num).toDouble(),
    );
  }
}

class PaymentSchedule {
  final String id;
  final String loanId;
  final int weekNumber;
  final DateTime dueDate;
  final double amountDue;
  final double amountPaid;
  final String status;

  PaymentSchedule({
    required this.id,
    required this.loanId,
    required this.weekNumber,
    required this.dueDate,
    required this.amountDue,
    required this.amountPaid,
    required this.status,
  });

  factory PaymentSchedule.fromJson(Map<String, dynamic> json) {
    return PaymentSchedule(
      id: json['id'] as String,
      loanId: json['loanId'] as String,
      weekNumber: json['weekNumber'] as int,
      dueDate: DateTime.parse(json['dueDate'] as String),
      amountDue: (json['amountDue'] as num).toDouble(),
      amountPaid: (json['amountPaid'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String,
    );
  }

  bool get isPaid => status == 'PAID';
  bool get isPartial => status == 'PARTIAL';
  bool get isOverdue => status == 'OVERDUE';
  bool get isPending => status == 'PENDING';
}
