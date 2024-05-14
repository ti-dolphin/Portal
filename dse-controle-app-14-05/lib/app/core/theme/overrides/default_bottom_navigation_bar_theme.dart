import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';

class DefaultBottomNavigationBarTheme {
  static final BottomNavigationBarThemeData data = BottomNavigationBarThemeData(
    backgroundColor: Colors.white,
    type: BottomNavigationBarType.fixed,
    selectedLabelStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary600), 
    unselectedLabelStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.neutral500), 
    selectedItemColor: AppColors.primary700,
    selectedIconTheme: const IconThemeData(
      color: AppColors.primary600,
    ),
    unselectedIconTheme: const IconThemeData(
      color: AppColors.neutral500,
    ),
  );
}
