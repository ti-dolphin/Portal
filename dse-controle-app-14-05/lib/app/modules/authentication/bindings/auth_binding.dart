import 'package:dse_controle_app/app/modules/authentication/controllers/login_controller.dart';
import 'package:dse_controle_app/app/modules/authentication/controllers/new_password_controller.dart';
import 'package:dse_controle_app/app/modules/authentication/controllers/recovery_password_controller.dart';
import 'package:get/get.dart';

class AuthBinding implements Bindings {

  @override
  void dependencies() {
    Get.put<LoginController>(LoginController());
    Get.lazyPut<RecoveryPasswordController>(() => RecoveryPasswordController(), fenix: true);
    Get.lazyPut<NewPasswordController>(() => NewPasswordController(), fenix: true);
  }
}
