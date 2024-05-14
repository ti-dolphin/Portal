import 'package:dse_controle_app/app/data/services/log_service.dart';
import 'package:dse_controle_app/app/data/services/user_service.dart';
import 'package:dse_controle_app/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rox/mixins/fetch_data_mixin.dart';

class LoginController extends GetxController with FetchDataMixin {
  RxBool obscureText = RxBool(true);
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  GlobalKey<FormState> formKey = GlobalKey<FormState>();
  LogService _logService = Get.find<LogService>();

  void onTapObscureIcon() {
    obscureText.value = !obscureText.value;
  }

  Future<void> onLogin() async {
    if (formKey.currentState!.validate()) {
      await showLoadingWhileRunning(() async {
        await UserService.instance.login(emailController.text, passwordController.text);
        // _logService.register(UserService.userId, 'Login', 'Usuário ${UserService.userId} fez login');
      });
    }
  }

  void forgotPassword() {
    Get.toNamed(AppRoutes.recoveryPassword);
  }
}
