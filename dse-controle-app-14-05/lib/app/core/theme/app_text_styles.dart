import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:flutter/material.dart';

abstract class AppTextStyles {
  
  static const titleLarge = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w400,
    fontSize: 34,
    letterSpacing: 0.1,
    color: AppColors.neutral900
  );

  static const titleMedium = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w400,
    fontSize: 24,
    letterSpacing: 0.1,
    color: AppColors.neutral900
  );

  static const titleSmall = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w400,
    fontSize: 20,
    letterSpacing: 0.1,
    color: AppColors.neutral900
  );

  static const labelLarge = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w500,
    fontSize: 16,
    letterSpacing: 0.3,
    color: AppColors.neutral900
  );

  static const labelMedium = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w500,
    fontSize: 14,
    letterSpacing: 0.3,
    color: AppColors.neutral900
  );

  static const labelSmall = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w500,
    fontSize: 12,
    letterSpacing: 0.3,
    color: AppColors.neutral900
  );

  static const bodyLarge = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w400,
    fontSize: 16,
    letterSpacing: 0.25,
    color: AppColors.neutral900
  );

  static const bodyMedium = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w400,
    fontSize: 14,
    letterSpacing: 0.25,
    color: AppColors.neutral900
  );

  static const bodySmall = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w400,
    fontSize: 12,
    letterSpacing: 0.25,
    color: AppColors.neutral900
  );

  static const overline = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w500,
    fontSize: 10,
    letterSpacing: 0.5,
    color: AppColors.neutral900
  );

}
