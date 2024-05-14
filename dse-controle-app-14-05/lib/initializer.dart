import 'package:dio/dio.dart';
import 'package:dse_controle_app/app/core/consts.dart';
import 'package:dse_controle_app/app/core/theme/rox_style_instances/rox_colors_instance.dart';
import 'package:dse_controle_app/app/core/theme/rox_style_instances/rox_text_style_instance.dart';
import 'package:dse_controle_app/app/data/repositories/auth_repository.dart';
import 'package:dse_controle_app/app/data/repositories/log_repository.dart';
import 'package:dse_controle_app/app/data/services/log_service.dart';
import 'package:dse_controle_app/app/data/services/notification_service.dart';
import 'package:dse_controle_app/app/data/services/token_service.dart';
import 'package:dse_controle_app/app/data/services/user_service.dart';
import 'package:flutter/material.dart';
import 'package:get/instance_manager.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:rox/rox.dart' as rox;
import 'package:rox_client/rox_client.dart';

class Initializer {
  static Future<void> init() async {
    WidgetsFlutterBinding.ensureInitialized();

    await TokenService.init();

    RoxClient dioClient = DioClient(Consts.baseUrl, Dio());

    AuthClient.init(
      getNewTokenUrl: '/auth/getNewToken',
      getAccessToken: TokenService.instance.getAccessToken,
      getRefreshToken: TokenService.instance.getRefreshToken,
      setAccessToken: TokenService.instance.setAccessToken,
      onInvalidToken: () {},
      baseUrl: Consts.baseUrl,
    );

    /// Repositories
    Get.lazyPut(() => AuthRepository(AuthClient.instance, dioClient), fenix: true);
    Get.lazyPut(() => LogRepository(AuthClient.instance), fenix: true);

    /// Services
    Get.lazyPut(() => LogService(Get.find<LogRepository>()));
    Get.lazyPut(() => NotificationService());
    UserService.init(Get.find<AuthRepository>());
    await Get.putAsync(() async => PackageInfo.fromPlatform());
    rox.Initializer.init(colorTheme: roxColorsInstance, textTheme: roxTextStylesInstance);
  }
}
