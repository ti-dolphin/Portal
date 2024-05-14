import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';

class MessageDialog extends StatelessWidget {
  final String message;
  final String botaoText;
  
  const MessageDialog({
    super.key,
    required this.message,
    required this.botaoText,
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
            Text(
              message,
              style: AppTextStyles.labelMedium,
              textAlign: TextAlign.center,
            ),
            // LargeButtonFilled(
            //   icon: Icons.check,
            //   text: botaoText,
            //   onPressed: () => Get.back(),
            // )
          ],
        ),
      ),
    );
  }
}
