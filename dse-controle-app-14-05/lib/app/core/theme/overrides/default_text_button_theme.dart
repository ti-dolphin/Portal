import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';

class DefaultTextButtonTheme {

  static final TextButtonThemeData data = TextButtonThemeData(
    style: ButtonStyle(
      alignment: Alignment.center,
      // minimumSize: MaterialStateProperty.all(const Size.fromHeight(AppSizes.buttonHeight)),
      // maximumSize: MaterialStateProperty.all(const Size.fromHeight(AppSizes.buttonHeight)),
      minimumSize: MaterialStateProperty.all(Size.zero),
      elevation: MaterialStateProperty.all(0.0),
      padding: MaterialStateProperty.all(const EdgeInsets.all(AppSizes.spacingUnit8)),
      foregroundColor: MaterialStateProperty.resolveWith<Color>((states) {
        if (states.contains(MaterialState.disabled)) {
          return AppColors.neutral400;
        }
        if (states.contains(MaterialState.error)){
          return AppColors.error300;
        }
        return AppColors.primary600;
      }),
      textStyle: MaterialStateProperty.resolveWith<TextStyle>((states) {
        if (states.contains(MaterialState.disabled)) {
          return AppTextStyles.labelLarge.copyWith(color: AppColors.neutral400);
        }
        if (states.contains(MaterialState.error)){
          return AppTextStyles.labelLarge.copyWith(color: AppColors.error300);
        }
        return AppTextStyles.labelLarge.copyWith(color: AppColors.primary600);
      }),
      overlayColor: MaterialStateProperty.resolveWith<Color>((states){
        if (states.contains(MaterialState.disabled)) {
          return AppColors.neutral100;
        }
        if (states.contains(MaterialState.error)){
          return AppColors.error300;
        }
        return AppColors.primary100;
      }),
      backgroundColor: MaterialStateProperty.resolveWith<Color>((states){
        if (states.contains(MaterialState.disabled)) {
          return AppColors.neutral100;
        }
        if (states.contains(MaterialState.error)){
          return AppColors.error300;
        }
        return AppColors.transparent;
      }),
      shape: MaterialStateProperty.resolveWith<OutlinedBorder>((states) {
        if (states.contains(MaterialState.disabled)) {
          return RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusUnit8)
          );
        }
        if (states.contains(MaterialState.error)){
          return RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusUnit8), 
            side: const BorderSide(width: 0.5, color: AppColors.error500)
          );
        }
        return RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusUnit8)
        );
      }),
    ),
  );
}
