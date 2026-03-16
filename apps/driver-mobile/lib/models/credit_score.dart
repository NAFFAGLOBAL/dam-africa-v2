class CreditScore {
  final String id;
  final String userId;
  final int score;
  final String rating;
  final int paymentScore;
  final int incomeScore;
  final int drivingScore;
  final double maxLoanAmount;
  final double interestRate;
  final Map<String, dynamic>? breakdown;
  final String calculatedAt;

  CreditScore({
    required this.id,
    required this.userId,
    required this.score,
    required this.rating,
    required this.paymentScore,
    required this.incomeScore,
    required this.drivingScore,
    required this.maxLoanAmount,
    required this.interestRate,
    this.breakdown,
    required this.calculatedAt,
  });

  factory CreditScore.fromJson(Map<String, dynamic> json) {
    return CreditScore(
      id: json['id'] as String,
      userId: json['userId'] as String,
      score: json['score'] as int? ?? 0,
      rating: json['rating'] as String? ?? 'E',
      paymentScore: json['paymentScore'] as int? ?? 0,
      incomeScore: json['incomeScore'] as int? ?? 0,
      drivingScore: json['drivingScore'] as int? ?? 0,
      maxLoanAmount: (json['maxLoanAmount'] as num?)?.toDouble() ?? 0,
      interestRate: (json['interestRate'] as num?)?.toDouble() ?? 0,
      breakdown: json['breakdown'] as Map<String, dynamic>?,
      calculatedAt: json['calculatedAt'] as String,
    );
  }

  double get scorePercent => score / 1000;

  String get ratingLabel {
    switch (rating) {
      case 'A':
        return 'Excellent';
      case 'B':
        return 'Bon';
      case 'C':
        return 'Moyen';
      case 'D':
        return 'Faible';
      case 'E':
        return 'Très faible';
      default:
        return rating;
    }
  }
}
