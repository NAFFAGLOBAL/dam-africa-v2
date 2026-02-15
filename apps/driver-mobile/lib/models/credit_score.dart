class CreditScore {
  final String id;
  final String userId;
  final int score;
  final String rating;
  final Map<String, dynamic> components;
  final DateTime calculatedAt;

  CreditScore({
    required this.id,
    required this.userId,
    required this.score,
    required this.rating,
    required this.components,
    required this.calculatedAt,
  });

  factory CreditScore.fromJson(Map<String, dynamic> json) {
    return CreditScore(
      id: json['id'] as String,
      userId: json['userId'] as String,
      score: json['score'] as int,
      rating: json['rating'] as String,
      components: json['components'] as Map<String, dynamic>? ?? {},
      calculatedAt: DateTime.parse(json['calculatedAt'] as String),
    );
  }

  String get ratingDescription {
    switch (rating) {
      case 'A':
        return 'Excellent — Prêt max: 2 000 000 CFA';
      case 'B':
        return 'Très Bien — Prêt max: 1 500 000 CFA';
      case 'C':
        return 'Bien — Prêt max: 1 000 000 CFA';
      case 'D':
        return 'Passable — Prêt max: 500 000 CFA';
      case 'E':
        return 'À améliorer — Non éligible';
      default:
        return '';
    }
  }

  double get paymentHistoryScore {
    return (components['paymentHistory'] as num?)?.toDouble() ?? 0.0;
  }

  double get loanUtilizationScore {
    return (components['loanUtilization'] as num?)?.toDouble() ?? 0.0;
  }

  double get accountAgeScore {
    return (components['accountAge'] as num?)?.toDouble() ?? 0.0;
  }

  double get drivingPerformanceScore {
    return (components['drivingPerformance'] as num?)?.toDouble() ?? 0.0;
  }

  double get kycCompletenessScore {
    return (components['kycCompleteness'] as num?)?.toDouble() ?? 0.0;
  }
}

class CreditScoreHistory {
  final String id;
  final String userId;
  final int score;
  final String rating;
  final DateTime createdAt;

  CreditScoreHistory({
    required this.id,
    required this.userId,
    required this.score,
    required this.rating,
    required this.createdAt,
  });

  factory CreditScoreHistory.fromJson(Map<String, dynamic> json) {
    return CreditScoreHistory(
      id: json['id'] as String,
      userId: json['userId'] as String,
      score: json['score'] as int,
      rating: json['rating'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class ScoreComponent {
  final String name;
  final double score;
  final double weight;
  final String description;

  ScoreComponent({
    required this.name,
    required this.score,
    required this.weight,
    required this.description,
  });

  static List<ScoreComponent> getComponents(CreditScore creditScore) {
    return [
      ScoreComponent(
        name: 'Historique de Paiement',
        score: creditScore.paymentHistoryScore,
        weight: 35,
        description: 'Vos paiements à temps',
      ),
      ScoreComponent(
        name: 'Utilisation des Prêts',
        score: creditScore.loanUtilizationScore,
        weight: 30,
        description: 'Nombre de prêts actifs',
      ),
      ScoreComponent(
        name: 'Ancienneté du Compte',
        score: creditScore.accountAgeScore,
        weight: 15,
        description: 'Durée de votre compte',
      ),
      ScoreComponent(
        name: 'Performance de Conduite',
        score: creditScore.drivingPerformanceScore,
        weight: 10,
        description: 'Qualité de conduite',
      ),
      ScoreComponent(
        name: 'Complétude KYC',
        score: creditScore.kycCompletenessScore,
        weight: 10,
        description: 'Documents vérifiés',
      ),
    ];
  }
}
