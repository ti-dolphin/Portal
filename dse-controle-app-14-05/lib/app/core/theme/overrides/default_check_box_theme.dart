import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:flutter/material.dart';

class DefaultCheckBoxTheme {
  static final CheckboxThemeData data = CheckboxThemeData(
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(4),
      side: const BorderSide(color: AppColors.neutral500, width: 0.5)
    ),
  );
}
