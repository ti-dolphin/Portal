import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';

class DefaultTabBarTheme {

  static const TabBarTheme data = TabBarTheme(
    labelColor: AppColors.primary600,
    labelStyle: AppTextStyles.labelLarge,
    unselectedLabelColor: AppColors.neutral400,
    indicatorSize: TabBarIndicatorSize.tab,
    unselectedLabelStyle: AppTextStyles.labelLarge,
    labelPadding: EdgeInsets.symmetric(horizontal: AppSizes.spacingUnit8),
    indicator: UnderlineTabIndicator(
      insets: EdgeInsets.only(top: AppSizes.spacingUnit12),
      borderSide: BorderSide(
        color: AppColors.primary600,
        width: AppSizes.spacingUnit2,
      ),
    ),
  );
}