import 'package:dse_controle_app/app/modules/authentication/bindings/auth_binding.dart';
import 'package:dse_controle_app/app/modules/authentication/bindings/landing_binding.dart';
import 'package:dse_controle_app/app/modules/authentication/pages/landing_page.dart';
import 'package:dse_controle_app/app/modules/authentication/pages/login_page.dart';
import 'package:dse_controle_app/app/modules/authentication/pages/new_password_page.dart';
import 'package:dse_controle_app/app/modules/authentication/pages/recovery_password_page.dart';
import 'package:dse_controle_app/app/modules/web_view/bindings/web_view_binding.dart';
import 'package:dse_controle_app/app/modules/web_view/pages/webview_page.dart';
import 'package:dse_controle_app/routes/app_routes.dart';
import 'package:get/get.dart';

class AppPages {
  static final List<GetPage> pages = [
    GetPage(
      name: AppRoutes.landing,
      page: () => const LandingPage(),
      binding: LandingBinding(),
    ),
    GetPage(
      name: AppRoutes.login,
      page: () => const LoginPage(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.recoveryPassword,
      page: () => const RecoveryPasswordPage(),
      // binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.newPassword(':id', ':email', ':code'),
      page: () => const NewPasswordPage(),
      // binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => const WebViewPage(),
      binding: WebViewBinding(),
    ),
  ];
}
