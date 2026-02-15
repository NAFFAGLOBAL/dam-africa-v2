import 'package:flutter/material.dart';
import '../../config/api_config.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../models/kyc_document.dart';
import '../../services/api_service.dart';

class KYCScreen extends StatefulWidget {
  const KYCScreen({super.key});

  @override
  State<KYCScreen> createState() => _KYCScreenState();
}

class _KYCScreenState extends State<KYCScreen> {
  final ApiService _api = ApiService();
  KYCStatus? _status;
  List<KYCDocument> _documents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadKYCStatus();
  }

  Future<void> _loadKYCStatus() async {
    setState(() => _isLoading = true);

    try {
      final statusResponse = await _api.get(ApiConfig.kycStatus);
      final docsResponse = await _api.get(ApiConfig.kycDocuments);

      setState(() {
        _status = KYCStatus.fromJson(
          statusResponse.data as Map<String, dynamic>,
        );
        _documents = (docsResponse.data as List<dynamic>)
            .map((json) => KYCDocument.fromJson(json as Map<String, dynamic>))
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors du chargement du statut KYC'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }

  Future<void> _submitDocument(String documentType) async {
    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (context) => _DocumentFormDialog(documentType: documentType),
    );

    if (result == null) return;

    try {
      await _api.post(ApiConfig.kycSubmit, data: {
        'documentType': documentType,
        ...result,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document soumis avec succès'),
            backgroundColor: AppTheme.secondary,
          ),
        );
        _loadKYCStatus();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de la soumission'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }

  void _continue() {
    Navigator.of(context).pushReplacementNamed(Routes.home);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final requiredDocs = [
      'ID_CARD',
      'DRIVERS_LICENSE',
      'SELFIE',
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vérification KYC'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          if (_status != null)
            LinearProgressIndicator(
              value: _status!.progressPercentage / 100,
              backgroundColor: AppTheme.border,
              valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.secondary),
            ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                const Text(
                  'Documents requis',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Soumettez les documents suivants pour vérification',
                  style: TextStyle(
                    fontSize: 16,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 24),
                ...requiredDocs.map((docType) {
                  final doc = _documents
                      .where((d) => d.documentType == docType)
                      .firstOrNull;
                  return _DocumentTile(
                    documentType: docType,
                    document: doc,
                    onTap: () => _submitDocument(docType),
                  );
                }),
                const SizedBox(height: 32),
                if (_status != null &&
                    _status!.submittedDocuments.length >= 3)
                  ElevatedButton(
                    onPressed: _continue,
                    child: const Text('Continuer'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DocumentTile extends StatelessWidget {
  final String documentType;
  final KYCDocument? document;
  final VoidCallback onTap;

  const _DocumentTile({
    required this.documentType,
    this.document,
    required this.onTap,
  });

  String _getDocumentName(String type) {
    switch (type) {
      case 'ID_CARD':
        return 'Carte d\'identité';
      case 'DRIVERS_LICENSE':
        return 'Permis de conduire';
      case 'SELFIE':
        return 'Selfie';
      default:
        return type;
    }
  }

  Color _getStatusColor() {
    if (document == null) return AppTheme.textSecondary;
    if (document!.isApproved) return AppTheme.statusApproved;
    if (document!.isPending) return AppTheme.statusPending;
    if (document!.isRejected) return AppTheme.statusRejected;
    return AppTheme.textSecondary;
  }

  String _getStatusText() {
    if (document == null) return 'Non soumis';
    if (document!.isApproved) return 'Approuvé';
    if (document!.isPending) return 'En attente';
    if (document!.isRejected) return 'Rejeté';
    return 'Non soumis';
  }

  IconData _getStatusIcon() {
    if (document == null) return Icons.upload_file;
    if (document!.isApproved) return Icons.check_circle;
    if (document!.isPending) return Icons.schedule;
    if (document!.isRejected) return Icons.cancel;
    return Icons.upload_file;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getStatusColor().withOpacity(0.1),
          child: Icon(
            _getStatusIcon(),
            color: _getStatusColor(),
          ),
        ),
        title: Text(_getDocumentName(documentType)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _getStatusText(),
              style: TextStyle(color: _getStatusColor()),
            ),
            if (document?.isRejected == true && document?.rejectionReason != null)
              Text(
                document!.rejectionReason!,
                style: const TextStyle(
                  color: AppTheme.danger,
                  fontSize: 12,
                ),
              ),
          ],
        ),
        trailing: document?.isApproved == true
            ? null
            : const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: document?.isApproved == true ? null : onTap,
      ),
    );
  }
}

class _DocumentFormDialog extends StatefulWidget {
  final String documentType;

  const _DocumentFormDialog({required this.documentType});

  @override
  State<_DocumentFormDialog> createState() => _DocumentFormDialogState();
}

class _DocumentFormDialogState extends State<_DocumentFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _documentNumberController = TextEditingController();
  final _frontImageUrlController = TextEditingController();
  final _backImageUrlController = TextEditingController();
  DateTime? _expiryDate;

  @override
  void dispose() {
    _documentNumberController.dispose();
    _frontImageUrlController.dispose();
    _backImageUrlController.dispose();
    super.dispose();
  }

  bool get _needsDocumentNumber =>
      widget.documentType == 'ID_CARD' ||
      widget.documentType == 'DRIVERS_LICENSE';

  bool get _needsExpiryDate =>
      widget.documentType == 'ID_CARD' ||
      widget.documentType == 'DRIVERS_LICENSE';

  bool get _needsBackImage => widget.documentType == 'ID_CARD';

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    final result = <String, String>{};

    if (_needsDocumentNumber && _documentNumberController.text.isNotEmpty) {
      result['documentNumber'] = _documentNumberController.text;
    }

    if (_needsExpiryDate && _expiryDate != null) {
      result['expiryDate'] = _expiryDate!.toIso8601String();
    }

    if (_frontImageUrlController.text.isNotEmpty) {
      result['frontImageUrl'] = _frontImageUrlController.text;
    }

    if (_needsBackImage && _backImageUrlController.text.isNotEmpty) {
      result['backImageUrl'] = _backImageUrlController.text;
    }

    Navigator.of(context).pop(result);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Soumettre le document'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_needsDocumentNumber)
                TextFormField(
                  controller: _documentNumberController,
                  decoration: const InputDecoration(
                    labelText: 'Numéro du document',
                  ),
                  validator: (value) {
                    if (_needsDocumentNumber &&
                        (value == null || value.isEmpty)) {
                      return 'Numéro requis';
                    }
                    return null;
                  },
                ),
              if (_needsExpiryDate) ...[
                const SizedBox(height: 16),
                ListTile(
                  title: Text(_expiryDate == null
                      ? 'Date d\'expiration'
                      : 'Expire le: ${_expiryDate!.day}/${_expiryDate!.month}/${_expiryDate!.year}'),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now().add(const Duration(days: 365)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 3650)),
                    );
                    if (date != null) {
                      setState(() => _expiryDate = date);
                    }
                  },
                ),
              ],
              const SizedBox(height: 16),
              TextFormField(
                controller: _frontImageUrlController,
                decoration: const InputDecoration(
                  labelText: 'URL de l\'image (recto)',
                  hintText: 'https://...',
                ),
              ),
              if (_needsBackImage) ...[
                const SizedBox(height: 16),
                TextFormField(
                  controller: _backImageUrlController,
                  decoration: const InputDecoration(
                    labelText: 'URL de l\'image (verso)',
                    hintText: 'https://...',
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          onPressed: _submit,
          child: const Text('Soumettre'),
        ),
      ],
    );
  }
}
