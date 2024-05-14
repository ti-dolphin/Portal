import 'package:dse_controle_app/app/data/services/user_service.dart';
import 'package:dse_controle_app/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rox/mixins/fetch_data_mixin.dart';
import 'package:rox/widgets/snackbar/plannie_snack_bar.dart';

class NewPasswordController extends GetxController with FetchDataMixin {
  String id = Get.parameters['id'] ?? '';
  String code = Get.parameters['code'] ?? '';
  RxBool obscureText = RxBool(true);
  RxBool isEnabledButton = RxBool(false);
  RxBool hasCodeError = RxBool(false);
  FocusNode focusNode = FocusNode();
  TextEditingController emailController = TextEditingController(text: Get.parameters['email'] ?? '');
  TextEditingController passwordController1 = TextEditingController();
  TextEditingController passwordController2 = TextEditingController();
  final GlobalKey<FormState> formKey = GlobalKey<FormState>(debugLabel: 'newPassword');

  @override
  void dispose() {
    focusNode.dispose();
    super.dispose();
  }

  Future<void> validaToken(String value, BuildContext context) async {
    if (value == code) {
      isEnabledButton.value = true;
      FocusScope.of(context).requestFocus(focusNode);
    } else {
      isEnabledButton.value = false;
    }
    if (value.length == 6 && value != code) {
      hasCodeError.value = true;
    } else {
      hasCodeError.value = false;
    }
  }

  Future<void> updatePassword() async {
    if (formKey.currentState!.validate()) {
      if (passwordController1.text == passwordController2.text) {
        await showLoadingWhileRunning(() async {
          await UserService.instance.updatePassword(id, passwordController1.text);
          back();
        });
      } else {
        RoxSnackBar.showErrorSnackbar('As senhas não correspondem');
      }
    }
  }

  void back() {
    Get.offNamedUntil(AppRoutes.login, (route) => route.isFirst);
  }
}
