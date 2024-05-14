import 'package:dse_controle_app/app/data/models/recovery_password_model.dart';
import 'package:dse_controle_app/app/data/services/user_service.dart';
import 'package:dse_controle_app/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rox/mixins/fetch_data_mixin.dart';

class RecoveryPasswordController extends GetxController with FetchDataMixin {
  TextEditingController emailController = TextEditingController();
  final GlobalKey<FormState> formKey = GlobalKey<FormState>(debugLabel: 'recovery');

  Future<void> onLogin() async {
    if (formKey.currentState!.validate()) {
      await showLoadingWhileRunning(() async {
        RecoveryPasswordModel? result = await UserService.instance.recoveryPassword(emailController.text);
        if (result != null) {
          Get.toNamed(AppRoutes.newPassword(result.id, result.email, result.code));
        }
      });
    }
  }

  void back() {
    Get.back();
  }
}
