import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/loading_overlay.dart';
import '../providers/kyc_provider.dart';

class KycUploadScreen extends ConsumerStatefulWidget {
  const KycUploadScreen({super.key});

  @override
  ConsumerState<KycUploadScreen> createState() => _KycUploadScreenState();
}

class _KycUploadScreenState extends ConsumerState<KycUploadScreen> {
  static const List<_DocTypeOption> _docTypes = [
    _DocTypeOption(
      type: 'NATIONAL_ID',
      label: 'Carte d\'identit\u00e9',
      icon: Icons.badge_outlined,
      description: 'Carte nationale d\'identit\u00e9 en cours de validit\u00e9',
    ),
    _DocTypeOption(
      type: 'DRIVERS_LICENSE',
      label: 'Permis de conduire',
      icon: Icons.directions_car_outlined,
      description: 'Permis de conduire en cours de validit\u00e9',
    ),
    _DocTypeOption(
      type: 'PROOF_OF_ADDRESS',
      label: 'Justificatif de domicile',
      icon: Icons.home_outlined,
      description: 'Facture d\'\u00e9lectricit\u00e9, eau ou t\u00e9l\u00e9phone de moins de 3 mois',
    ),
    _DocTypeOption(
      type: 'SELFIE',
      label: 'Photo selfie',
      icon: Icons.camera_alt_outlined,
      description: 'Photo de votre visage, bien \u00e9clair\u00e9e et nette',
    ),
  ];

  String? _selectedType;
  File? _selectedImage;
  final ImagePicker _imagePicker = ImagePicker();

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final typeParam = GoRouterState.of(context).uri.queryParameters['type'];
    if (typeParam != null &&
        _selectedType == null &&
        _docTypes.any((d) => d.type == typeParam)) {
      setState(() {
        _selectedType = typeParam;
      });
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final pickedFile = await _imagePicker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );
      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Impossible d\'acc\u00e9der \u00e0 la cam\u00e9ra ou la galerie'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'Choisir une source',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.camera_alt,
                    color: AppColors.primary,
                  ),
                ),
                title: const Text(
                  'Cam\u00e9ra',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                subtitle: const Text(
                  'Prendre une photo maintenant',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                },
              ),
              const Divider(indent: 72),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.infoLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.photo_library,
                    color: AppColors.info,
                  ),
                ),
                title: const Text(
                  'Galerie',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                subtitle: const Text(
                  'Choisir une image existante',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                },
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submitDocument() async {
    if (_selectedType == null || _selectedImage == null) return;

    final success = await ref.read(kycProvider.notifier).submitDocument(
          type: _selectedType!,
          imageFile: _selectedImage!,
        );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Document soumis avec succ\u00e8s'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    } else {
      final error = ref.read(kycProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error ?? 'Erreur lors de l\'envoi du document'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final kycState = ref.watch(kycProvider);
    final canSubmit = _selectedType != null && _selectedImage != null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Soumettre un document'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: LoadingOverlay(
        isLoading: kycState.isSubmitting,
        message: 'Envoi en cours...',
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionTitle('Type de document'),
              const SizedBox(height: 12),
              _buildDocTypeSelector(),
              const SizedBox(height: 28),
              _buildSectionTitle('Image du document'),
              const SizedBox(height: 12),
              _buildImagePicker(),
              const SizedBox(height: 32),
              _buildSubmitButton(canSubmit),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildDocTypeSelector() {
    return Column(
      children: _docTypes.map((docType) {
        final isSelected = _selectedType == docType.type;
        final kycState = ref.watch(kycProvider);
        final existingDoc = kycState.documentForType(docType.type);
        final isAlreadyApproved = existingDoc != null && existingDoc.isApproved;

        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: InkWell(
            onTap: isAlreadyApproved
                ? null
                : () {
                    setState(() {
                      _selectedType = docType.type;
                    });
                  },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isAlreadyApproved
                    ? AppColors.successLight.withOpacity(0.5)
                    : isSelected
                        ? AppColors.primary.withOpacity(0.06)
                        : AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isAlreadyApproved
                      ? AppColors.success.withOpacity(0.4)
                      : isSelected
                          ? AppColors.primary
                          : AppColors.divider,
                  width: isSelected ? 2.0 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isAlreadyApproved
                          ? AppColors.successLight
                          : isSelected
                              ? AppColors.primary.withOpacity(0.12)
                              : AppColors.background,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      docType.icon,
                      color: isAlreadyApproved
                          ? AppColors.success
                          : isSelected
                              ? AppColors.primary
                              : AppColors.textHint,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          docType.label,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isAlreadyApproved
                                ? AppColors.textSecondary
                                : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isAlreadyApproved
                              ? 'D\u00e9j\u00e0 approuv\u00e9'
                              : docType.description,
                          style: TextStyle(
                            fontSize: 12,
                            color: isAlreadyApproved
                                ? AppColors.success
                                : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isAlreadyApproved)
                    const Icon(
                      Icons.check_circle,
                      color: AppColors.success,
                      size: 22,
                    )
                  else if (isSelected)
                    const Icon(
                      Icons.radio_button_checked,
                      color: AppColors.primary,
                      size: 22,
                    )
                  else
                    const Icon(
                      Icons.radio_button_unchecked,
                      color: AppColors.textHint,
                      size: 22,
                    ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildImagePicker() {
    if (_selectedImage != null) {
      return Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Stack(
              children: [
                Image.file(
                  _selectedImage!,
                  width: double.infinity,
                  height: 280,
                  fit: BoxFit.cover,
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Row(
                    children: [
                      _buildImageActionButton(
                        icon: Icons.refresh,
                        label: 'Changer',
                        onTap: _showImageSourceDialog,
                      ),
                      const SizedBox(width: 8),
                      _buildImageActionButton(
                        icon: Icons.close,
                        label: 'Retirer',
                        onTap: () {
                          setState(() {
                            _selectedImage = null;
                          });
                        },
                        isDestructive: true,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _selectedImage!.path.split('/').last,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      );
    }

    return InkWell(
      onTap: _showImageSourceDialog,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: double.infinity,
        height: 200,
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.divider,
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.add_a_photo_outlined,
                color: AppColors.primary,
                size: 36,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Appuyez pour ajouter une image',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Cam\u00e9ra ou galerie photo',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return Material(
      color: isDestructive
          ? AppColors.error.withOpacity(0.9)
          : Colors.black.withOpacity(0.6),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: Colors.white, size: 16),
              const SizedBox(width: 4),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSubmitButton(bool canSubmit) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton.icon(
        onPressed: canSubmit ? _submitDocument : null,
        icon: const Icon(Icons.upload_outlined),
        label: const Text(
          'Soumettre le document',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textOnPrimary,
          disabledBackgroundColor: AppColors.disabled.withOpacity(0.3),
          disabledForegroundColor: AppColors.disabled,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: canSubmit ? 2 : 0,
        ),
      ),
    );
  }
}

class _DocTypeOption {
  final String type;
  final String label;
  final IconData icon;
  final String description;

  const _DocTypeOption({
    required this.type,
    required this.label,
    required this.icon,
    required this.description,
  });
}
