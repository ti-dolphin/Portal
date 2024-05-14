abstract class AppRoutes {
  static const String splash = '/';
  static const String landing = '/landing';
  static const String login = '/login';
  static const String recoveryPassword = '/recovery-password';
  static  String newPassword(String id, String email, String code) => '/new-password/$id/$email/$code';
  static const String home = '/home';
  static const String notFound= '/not-found';
}
