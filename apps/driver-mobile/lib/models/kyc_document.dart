class KycDocument {
  final String id;
  final String userId;
  final String type;
  final String fileUrl;
  final String? fileName;
  final String status;
  final String? reviewedBy;
  final String? reviewNote;
  final String? reviewedAt;
  final String? expiresAt;
  final String createdAt;

  KycDocument({
    required this.id,
    required this.userId,
    required this.type,
    required this.fileUrl,
    this.fileName,
    required this.status,
    this.reviewedBy,
    this.reviewNote,
    this.reviewedAt,
    this.expiresAt,
    required this.createdAt,
  });

  factory KycDocument.fromJson(Map<String, dynamic> json) {
    return KycDocument(
      id: json['id'] as String,
      userId: json['userId'] as String,
      type: json['type'] as String,
      fileUrl: json['fileUrl'] as String,
      fileName: json['fileName'] as String?,
      status: json['status'] as String,
      reviewedBy: json['reviewedBy'] as String?,
      reviewNote: json['reviewNote'] as String?,
      reviewedAt: json['reviewedAt'] as String?,
      expiresAt: json['expiresAt'] as String?,
      createdAt: json['createdAt'] as String,
    );
  }

  bool get isPending => status == 'PENDING';
  bool get isApproved => status == 'APPROVED';
  bool get isRejected => status == 'REJECTED';

  String get typeLabel {
    switch (type) {
      case 'NATIONAL_ID':
        return 'Carte d\'identité';
      case 'DRIVERS_LICENSE':
        return 'Permis de conduire';
      case 'PASSPORT':
        return 'Passeport';
      case 'PROOF_OF_ADDRESS':
        return 'Justificatif de domicile';
      case 'SELFIE':
        return 'Photo selfie';
      default:
        return 'Autre document';
    }
  }

  String get statusLabel {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      default:
        return status;
    }
  }
}

class KycStatus {
  final bool isVerified;
  final int total;
  final int approved;
  final int pending;
  final int rejected;
  final List<KycDocument> documents;

  KycStatus({
    required this.isVerified,
    required this.total,
    required this.approved,
    required this.pending,
    required this.rejected,
    required this.documents,
  });

  factory KycStatus.fromJson(Map<String, dynamic> json) {
    return KycStatus(
      isVerified: json['isVerified'] as bool? ?? false,
      total: json['total'] as int? ?? 0,
      approved: json['approved'] as int? ?? 0,
      pending: json['pending'] as int? ?? 0,
      rejected: json['rejected'] as int? ?? 0,
      documents: (json['documents'] as List<dynamic>?)
              ?.map((d) => KycDocument.fromJson(d as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
