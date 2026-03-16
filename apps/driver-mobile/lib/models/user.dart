class User {
  final String id;
  final String email;
  final String phone;
  final String firstName;
  final String lastName;
  final String? dateOfBirth;
  final String? city;
  final String? address;
  final String? profilePhoto;
  final String? licenseNumber;
  final String status;
  final bool isVerified;
  final String? lastLoginAt;
  final String? createdAt;

  User({
    required this.id,
    required this.email,
    required this.phone,
    required this.firstName,
    required this.lastName,
    this.dateOfBirth,
    this.city,
    this.address,
    this.profilePhoto,
    this.licenseNumber,
    required this.status,
    required this.isVerified,
    this.lastLoginAt,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      dateOfBirth: json['dateOfBirth'] as String?,
      city: json['city'] as String?,
      address: json['address'] as String?,
      profilePhoto: json['profilePhoto'] as String?,
      licenseNumber: json['licenseNumber'] as String?,
      status: json['status'] as String,
      isVerified: json['isVerified'] as bool? ?? false,
      lastLoginAt: json['lastLoginAt'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'phone': phone,
        'firstName': firstName,
        'lastName': lastName,
        'dateOfBirth': dateOfBirth,
        'city': city,
        'address': address,
        'profilePhoto': profilePhoto,
        'licenseNumber': licenseNumber,
        'status': status,
        'isVerified': isVerified,
      };

  String get fullName => '$firstName $lastName';

  User copyWith({
    String? firstName,
    String? lastName,
    String? phone,
    String? city,
    String? address,
    String? dateOfBirth,
    String? licenseNumber,
    String? profilePhoto,
    String? status,
    bool? isVerified,
  }) {
    return User(
      id: id,
      email: email,
      phone: phone ?? this.phone,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      city: city ?? this.city,
      address: address ?? this.address,
      profilePhoto: profilePhoto ?? this.profilePhoto,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      status: status ?? this.status,
      isVerified: isVerified ?? this.isVerified,
      lastLoginAt: lastLoginAt,
      createdAt: createdAt,
    );
  }
}
