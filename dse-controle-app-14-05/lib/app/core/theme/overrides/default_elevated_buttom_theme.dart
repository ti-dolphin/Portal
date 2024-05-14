import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';

class DefaultElevatedButtonTheme {
  static final ElevatedButtonThemeData data = ElevatedButtonThemeData(
    style: ButtonStyle(
      alignment: Alignment.center,
      minimumSize: MaterialStateProperty.all(const Size.fromHeight(AppSizes.buttonHeight)),
      maximumSize: MaterialStateProperty.all(const Size.fromHeight(AppSizes.buttonHeight)),
      elevation: MaterialStateProperty.all(0.0),
      padding: MaterialStateProperty.all(const EdgeInsets.symmetric(vertical: AppSizes.spacingUnit2, horizontal: AppSizes.spacingUnit2)),
      foregroundColor: MaterialStateProperty.resolveWith<Color>((states) {
        if (states.contains(MaterialState.disabled)) {
          return AppColors.neutral400;
        }
        if (states.contains(MaterialState.error)){
          return AppColors.error300;
        }
        return AppColors.primary500;
      }),
      textStyle: MaterialStateProperty.resolveWith<TextStyle>((states) {
        if (states.contains(MaterialState.disabled)) {
          return AppTextStyles.labelLarge.copyWith(color: AppColors.neutral400);
        }
        if (states.contains(MaterialState.error)){
          return AppTextStyles.labelLarge.copyWith(color: AppColors.error300);
        }
        return AppTextStyles.labelLarge.copyWith(color: AppColors.primary500);
      }),
      backgroundColor: MaterialStateProperty.resolveWith<Color>((states){
        if (states.contains(MaterialState.disabled)) {
          return AppColors.neutral100;
        }
        if (states.contains(MaterialState.error)){
          return AppColors.error300;
        }
        return AppColors.primary500;
      }),
      shape: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.disabled)) {
          return RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusUnit8)
          );
        }
        if (states.contains(MaterialState.error)){
          return RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusUnit8)
          );
        }
        if (states.contains(MaterialState.pressed)){
          return RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusUnit8)
          );
        }
        return RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusUnit8), 
        );
      }),
    )
  );
}
