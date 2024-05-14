
import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ConfirmationModal extends StatelessWidget {
  final String message;
  final String confirmText;
  final String cancelText;
  final String? title;

  const ConfirmationModal({
    super.key,
    required this.message,
    required this.confirmText,
    required this.cancelText,
    this.title
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        top: 16,
        bottom: 8,
      ),
      child: SizedBox(
        width: double.infinity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            title != null ?
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Text(title!, style: AppTextStyles.titleSmall, textAlign: TextAlign.center,),
            ): const SizedBox(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(message, style: AppTextStyles.bodyLarge.copyWith(color: AppColors.neutral500, height: 1.5)),
            ),
            const SizedBox(height: 16),
            _buildButton(confirmText, () => Get.back(result: true)),
            _buildButton(cancelText, () => Get.back(result: false)),
          ],
        ),
      ),
    );
  }

  Widget _buildButton(String text, VoidCallback onPressed) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        child: SizedBox(
          width: double.infinity,
          height: 48,
          child: Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(text, style: AppTextStyles.bodyLarge, textAlign: TextAlign.start,),
            )),
        ),
      ),
    );
  }
}