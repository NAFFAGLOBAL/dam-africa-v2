class Vehicle {
  final String id;
  final String make;
  final String model;
  final int year;
  final String? licensePlate;
  final String? vin;
  final String status;

  Vehicle({
    required this.id,
    required this.make,
    required this.model,
    required this.year,
    this.licensePlate,
    this.vin,
    required this.status,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] as String,
      make: json['make'] as String,
      model: json['model'] as String,
      year: json['year'] as int,
      licensePlate: json['licensePlate'] as String?,
      vin: json['vin'] as String?,
      status: json['status'] as String? ?? 'ACTIVE',
    );
  }

  String get displayName => '$make $model ($year)';
}
