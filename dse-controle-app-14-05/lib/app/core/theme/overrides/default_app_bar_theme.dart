import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class DefaultAppBarTheme {
  static const AppBarTheme data = AppBarTheme(
    elevation: 0,
    backgroundColor: AppColors.transparent,
    centerTitle: false,
    titleTextStyle: AppTextStyles.titleSmall,
    systemOverlayStyle: SystemUiOverlayStyle(
      statusBarIconBrightness: Brightness.dark,
      statusBarColor: AppColors.white,
    ),
    iconTheme: IconThemeData(
      color: AppColors.neutral600,
      size: AppSizes.iconSizeUnit24
    ),
    actionsIconTheme: IconThemeData(
      color: AppColors.neutral600,
      size: AppSizes.iconSizeUnit24,
    ),
  );
}