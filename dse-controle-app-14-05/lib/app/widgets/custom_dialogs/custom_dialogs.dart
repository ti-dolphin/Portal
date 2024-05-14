import 'package:dse_controle_app/app/widgets/custom_dialogs/dialogs/confirm_dialog.dart';
import 'package:dse_controle_app/app/widgets/custom_dialogs/dialogs/message_dialog.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomDialogs {

  static Future<void> showMessageDialog(String mensagem, String botao) async {
    return Get.dialog(
      MessageDialog(
        message: mensagem,
        botaoText: botao,
      ),
    );
  }

  static Future<bool> showConfirmDialog({ required String message, String? title, String confirmText = 'CONFIMAR', String cancelText = 'CANCELAR', bool barrierDismissible = true }) async {
    return await Get.dialog(
      WillPopScope(
        child: ConfirmDialog(
          message: message,
          confirmText: confirmText,
          cancelText: cancelText,
          title: title,
        ),
        onWillPop: () async {
          if (barrierDismissible) {
            Get.back(result: false);
            return true;
          } else {
            return false;
          }
        },
      ),
      barrierDismissible: barrierDismissible,
    );
  }
}
