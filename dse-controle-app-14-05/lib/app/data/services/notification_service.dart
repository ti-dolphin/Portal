import 'dart:async';

import 'package:dse_controle_app/firebase_options.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';

class NotificationService extends GetxService {
  late AndroidNotificationChannel channel;
  late FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;
  InitializationSettings initializationSettings = const InitializationSettings(
    android: AndroidInitializationSettings('ic_launcher'),
    iOS: DarwinInitializationSettings()
  );

  @override
  Future<void> onInit() async {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform
    );

    channel = const AndroidNotificationChannel(
      'high_importance_channel',
      'Notificações de alta importancia',
      importance: Importance.max,
    );

    flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
    AndroidInitializationSettings androidInitialize = const AndroidInitializationSettings('mipmap/ic_launcher');
    DarwinInitializationSettings iOSInitialize = const DarwinInitializationSettings();
    InitializationSettings initializationsSettings = InitializationSettings(android: androidInitialize, iOS: iOSInitialize);
    await flutterLocalNotificationsPlugin.initialize(initializationsSettings);
    await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(alert: true, badge: true, sound: true);
    FirebaseMessaging.instance.getInitialMessage().then(_initialMessage);
    FirebaseMessaging.onMessage.listen(_onMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_onMessageOpenedApp);
    FirebaseMessaging.onBackgroundMessage(onBackgroundMessage);
    super.onInit();
  }

  void _initialMessage(RemoteMessage? message) {
    print('A new initialMessage event was published!');
  }

  void _onMessage(RemoteMessage message) {
    _showLocalNotification(title: message.notification?.title ?? '', body: message.notification?.body ?? '', payload: message.data['topic'] ?? '');
  }

  void _onMessageOpenedApp(RemoteMessage message) {
    print('A new onMessageOpenedApp event was published!');
  }

  // Chamado quando o app está em background
  @pragma('vm:entry-point')
  static Future onBackgroundMessage(RemoteMessage message) async {
    print('A new onBackgroundMessage event was published!');
  }

  Future<void> requestPermission() async {
    NotificationSettings settings = await FirebaseMessaging.instance.requestPermission();
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted permission');
    } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
      print('User granted provisional permission');
    } else {
      print('User declined or has not accepted permission');
    }
  }

  Future<void> subscribeToTopic(String topic) async {
    try {
      await FirebaseMessaging.instance.subscribeToTopic(topic);
    } catch (e) {
      print('Erro: $e');
    }
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await FirebaseMessaging.instance.unsubscribeFromTopic(topic);
    } catch (e) {
      print('Erro: $e');
    }
  }

  Future _showLocalNotification({int id = 0, required String title, required String body, String? payload}) async {
    AndroidNotificationDetails androidPlatformChannelSpecifics = const AndroidNotificationDetails(
      'you_can_name_it_whatever1',
      'channel_name',
      importance: Importance.max,
      priority: Priority.high,
    );

    NotificationDetails notificationDetails = NotificationDetails(android: androidPlatformChannelSpecifics, iOS: const DarwinNotificationDetails());
    await flutterLocalNotificationsPlugin.show(id, title, body, notificationDetails, payload: payload);
  }
}
