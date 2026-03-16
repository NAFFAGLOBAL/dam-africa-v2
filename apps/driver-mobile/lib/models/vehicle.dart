class Vehicle {
  final String id;
  final String registrationNo;
  final String make;
  final String model;
  final int year;
  final String? color;
  final String status;
  final double? dailyRate;
  final double? weeklyRate;
  final double? monthlyRate;
  final String? imageUrl;
  final String? fuelType;
  final String? transmission;
  final int? seatingCapacity;
  final String createdAt;

  Vehicle({
    required this.id,
    required this.registrationNo,
    required this.make,
    required this.model,
    required this.year,
    this.color,
    required this.status,
    this.dailyRate,
    this.weeklyRate,
    this.monthlyRate,
    this.imageUrl,
    this.fuelType,
    this.transmission,
    this.seatingCapacity,
    required this.createdAt,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] as String,
      registrationNo: json['registrationNo'] as String,
      make: json['make'] as String,
      model: json['model'] as String,
      year: json['year'] as int,
      color: json['color'] as String?,
      status: json['status'] as String,
      dailyRate: (json['dailyRate'] as num?)?.toDouble(),
      weeklyRate: (json['weeklyRate'] as num?)?.toDouble(),
      monthlyRate: (json['monthlyRate'] as num?)?.toDouble(),
      imageUrl: json['imageUrl'] as String?,
      fuelType: json['fuelType'] as String?,
      transmission: json['transmission'] as String?,
      seatingCapacity: json['seatingCapacity'] as int?,
      createdAt: json['createdAt'] as String,
    );
  }

  String get displayName => '$make $model ($year)';
  bool get isAvailable => status == 'AVAILABLE';
}
