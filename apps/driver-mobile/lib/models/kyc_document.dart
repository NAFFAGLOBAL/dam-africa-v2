class KYCDocument {
  final String id;
  final String userId;
  final String documentType;
  final String status;
  final String? documentNumber;
  final DateTime? expiryDate;
  final String? frontImageUrl;
  final String? backImageUrl;
  final String? rejectionReason;
  final DateTime? reviewedAt;
  final DateTime createdAt;

  KYCDocument({
    required this.id,
    required this.userId,
    required this.documentType,
    required this.status,
    this.documentNumber,
    this.expiryDate,
    this.frontImageUrl,
    this.backImageUrl,
    this.rejectionReason,
    this.reviewedAt,
    required this.createdAt,
  });

  factory KYCDocument.fromJson(Map<String, dynamic> json) {
    return KYCDocument(
      id: json['id'] as String,
      userId: json['userId'] as String,
      documentType: json['documentType'] as String,
      status: json['status'] as String,
      documentNumber: json['documentNumber'] as String?,
      expiryDate: json['expiryDate'] != null
          ? DateTime.parse(json['expiryDate'] as String)
          : null,
      frontImageUrl: json['frontImageUrl'] as String?,
      backImageUrl: json['backImageUrl'] as String?,
      rejectionReason: json['rejectionReason'] as String?,
      reviewedAt: json['reviewedAt'] != null
          ? DateTime.parse(json['reviewedAt'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  String get displayName {
    switch (documentType) {
      case 'ID_CARD':
        return 'Carte d\'identité';
      case 'DRIVERS_LICENSE':
        return 'Permis de conduire';
      case 'SELFIE':
        return 'Selfie';
      case 'PROOF_OF_ADDRESS':
        return 'Justificatif de domicile';
      default:
        return documentType;
    }
  }

  bool get isPending => status == 'PENDING';
  bool get isApproved => status == 'APPROVED';
  bool get isRejected => status == 'REJECTED';
}

class KYCStatus {
  final bool isComplete;
  final List<String> requiredDocuments;
  final List<String> submittedDocuments;
  final List<String> approvedDocuments;
  final List<String> pendingDocuments;
  final List<String> rejectedDocuments;

  KYCStatus({
    required this.isComplete,
    required this.requiredDocuments,
    required this.submittedDocuments,
    required this.approvedDocuments,
    required this.pendingDocuments,
    required this.rejectedDocuments,
  });

  factory KYCStatus.fromJson(Map<String, dynamic> json) {
    return KYCStatus(
      isComplete: json['isComplete'] as bool,
      requiredDocuments: (json['requiredDocuments'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      submittedDocuments: (json['submittedDocuments'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      approvedDocuments: (json['approvedDocuments'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      pendingDocuments: (json['pendingDocuments'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      rejectedDocuments: (json['rejectedDocuments'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }

  double get progressPercentage {
    if (requiredDocuments.isEmpty) return 0;
    return (submittedDocuments.length / requiredDocuments.length * 100)
        .clamp(0, 100);
  }
}
