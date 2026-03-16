class Loan {
  final String id;
  final String userId;
  final double amount;
  final double interestRate;
  final int termMonths;
  final double monthlyPayment;
  final double totalRepayment;
  final String? purpose;
  final String status;
  final int? creditScore;
  final String? creditRating;
  final String? approvedAt;
  final String? rejectedReason;
  final String? disbursedAt;
  final String? startDate;
  final String? endDate;
  final double paidAmount;
  final String createdAt;
  final List<LoanSchedule>? schedule;

  Loan({
    required this.id,
    required this.userId,
    required this.amount,
    required this.interestRate,
    required this.termMonths,
    required this.monthlyPayment,
    required this.totalRepayment,
    this.purpose,
    required this.status,
    this.creditScore,
    this.creditRating,
    this.approvedAt,
    this.rejectedReason,
    this.disbursedAt,
    this.startDate,
    this.endDate,
    required this.paidAmount,
    required this.createdAt,
    this.schedule,
  });

  factory Loan.fromJson(Map<String, dynamic> json) {
    return Loan(
      id: json['id'] as String,
      userId: json['userId'] as String,
      amount: (json['amount'] as num).toDouble(),
      interestRate: (json['interestRate'] as num).toDouble(),
      termMonths: json['termMonths'] as int,
      monthlyPayment: (json['monthlyPayment'] as num).toDouble(),
      totalRepayment: (json['totalRepayment'] as num).toDouble(),
      purpose: json['purpose'] as String?,
      status: json['status'] as String,
      creditScore: json['creditScore'] as int?,
      creditRating: json['creditRating'] as String?,
      approvedAt: json['approvedAt'] as String?,
      rejectedReason: json['rejectedReason'] as String?,
      disbursedAt: json['disbursedAt'] as String?,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
      paidAmount: (json['paidAmount'] as num?)?.toDouble() ?? 0,
      createdAt: json['createdAt'] as String,
      schedule: (json['schedule'] as List<dynamic>?)
          ?.map((s) => LoanSchedule.fromJson(s as Map<String, dynamic>))
          .toList(),
    );
  }

  double get progressPercent =>
      totalRepayment > 0 ? (paidAmount / totalRepayment).clamp(0, 1) : 0;

  double get remainingAmount => totalRepayment - paidAmount;

  String get statusLabel {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      case 'DISBURSED':
        return 'Décaissé';
      case 'ACTIVE':
        return 'Actif';
      case 'COMPLETED':
        return 'Terminé';
      case 'DEFAULTED':
        return 'En défaut';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  }

  bool get isActive => status == 'ACTIVE' || status == 'DISBURSED';
}

class LoanSchedule {
  final String id;
  final String loanId;
  final int installment;
  final String dueDate;
  final double amount;
  final double principal;
  final double interest;
  final double paidAmount;
  final String? paidAt;
  final String status;

  LoanSchedule({
    required this.id,
    required this.loanId,
    required this.installment,
    required this.dueDate,
    required this.amount,
    required this.principal,
    required this.interest,
    required this.paidAmount,
    this.paidAt,
    required this.status,
  });

  factory LoanSchedule.fromJson(Map<String, dynamic> json) {
    return LoanSchedule(
      id: json['id'] as String,
      loanId: json['loanId'] as String,
      installment: json['installment'] as int,
      dueDate: json['dueDate'] as String,
      amount: (json['amount'] as num).toDouble(),
      principal: (json['principal'] as num).toDouble(),
      interest: (json['interest'] as num).toDouble(),
      paidAmount: (json['paidAmount'] as num?)?.toDouble() ?? 0,
      paidAt: json['paidAt'] as String?,
      status: json['status'] as String,
    );
  }

  bool get isPaid => status == 'COMPLETED';
  bool get isOverdue {
    if (isPaid) return false;
    return DateTime.tryParse(dueDate)?.isBefore(DateTime.now()) ?? false;
  }
}

class LoanEligibility {
  final bool eligible;
  final String? reason;
  final double maxAmount;
  final double interestRate;
  final int? creditScore;
  final String? creditRating;

  LoanEligibility({
    required this.eligible,
    this.reason,
    required this.maxAmount,
    required this.interestRate,
    this.creditScore,
    this.creditRating,
  });

  factory LoanEligibility.fromJson(Map<String, dynamic> json) {
    return LoanEligibility(
      eligible: json['eligible'] as bool,
      reason: json['reason'] as String?,
      maxAmount: (json['maxAmount'] as num?)?.toDouble() ?? 0,
      interestRate: (json['interestRate'] as num?)?.toDouble() ?? 0,
      creditScore: json['creditScore'] as int?,
      creditRating: json['creditRating'] as String?,
    );
  }
}
