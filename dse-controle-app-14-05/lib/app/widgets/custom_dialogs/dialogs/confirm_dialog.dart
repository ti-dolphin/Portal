import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';

class ConfirmDialog extends StatelessWidget {
  final String message;
  final String confirmText;
  final String cancelText;
  final String? title;

  const ConfirmDialog({
    super.key,
    required this.message,
    required this.confirmText,
    required this.cancelText,
    this.title
  });
  
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            title != null ?
            Text(title!, style: AppTextStyles.titleSmall, textAlign: TextAlign.center,): const SizedBox(),
            Text(
              message,
              style: AppTextStyles.labelMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              child:  Text(confirmText, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),),
              onPressed: () => Get.back(result: true),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              child:  Text(cancelText, style: AppTextStyles.bodyMedium),
              onPressed: () => Get.back(result: false),
            ),
          ],
        ),
      ),
    );
  }
}
