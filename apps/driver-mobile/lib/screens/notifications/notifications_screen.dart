import 'package:flutter/material.dart';
import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../models/notification.dart';
import '../../services/api_service.dart';
import '../../utils/formatters.dart';
import '../../widgets/common/empty_state_widget.dart';
import '../../widgets/common/loading_widget.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _api = ApiService();
  List<AppNotification> _notifications = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _api.get(ApiConfig.notifications);
      final data = response.data as List<dynamic>;
      setState(() {
        _notifications = data
            .map((json) =>
                AppNotification.fromJson(json as Map<String, dynamic>))
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Erreur lors du chargement des notifications';
        _isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(String id) async {
    try {
      await _api.post(ApiConfig.notificationRead(id));
      setState(() {
        final index = _notifications.indexWhere((n) => n.id == id);
        if (index != -1) {
          final notification = _notifications[index];
          _notifications[index] = AppNotification(
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            isRead: true,
            metadata: notification.metadata,
            createdAt: notification.createdAt,
          );
        }
      });
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _api.post(ApiConfig.notificationsReadAll);
      setState(() {
        _notifications = _notifications
            .map((notification) => AppNotification(
                  id: notification.id,
                  userId: notification.userId,
                  type: notification.type,
                  title: notification.title,
                  message: notification.message,
                  isRead: true,
                  metadata: notification.metadata,
                  createdAt: notification.createdAt,
                ))
            .toList();
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Toutes les notifications ont été marquées comme lues'),
            backgroundColor: AppTheme.secondary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de la mise à jour'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Notifications'),
            if (unreadCount > 0)
              Text(
                '$unreadCount non lues',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.textSecondary,
                ),
              ),
          ],
        ),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text('Tout marquer lu'),
            ),
        ],
      ),
      body: _isLoading
          ? const LoadingWidget(message: 'Chargement des notifications...')
          : _error != null
              ? Center(child: Text(_error!))
              : _notifications.isEmpty
                  ? const EmptyStateWidget(
                      icon: Icons.notifications_none,
                      title: 'Aucune notification',
                      message: 'Vous n\'avez pas de notifications.',
                    )
                  : RefreshIndicator(
                      onRefresh: _loadNotifications,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final notification = _notifications[index];
                          return Card(
                            color: notification.isRead
                                ? null
                                : AppTheme.primary.withOpacity(0.05),
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: notification.isRead
                                    ? AppTheme.textSecondary.withOpacity(0.1)
                                    : AppTheme.primary.withOpacity(0.1),
                                child: Text(
                                  notification.icon,
                                  style: const TextStyle(fontSize: 20),
                                ),
                              ),
                              title: Text(
                                notification.title,
                                style: TextStyle(
                                  fontWeight: notification.isRead
                                      ? FontWeight.normal
                                      : FontWeight.bold,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text(notification.message),
                                  const SizedBox(height: 4),
                                  Text(
                                    Formatters.timeAgo(notification.createdAt),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              isThreeLine: true,
                              onTap: () {
                                if (!notification.isRead) {
                                  _markAsRead(notification.id);
                                }
                              },
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
