
import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/overrides/default_app_bar_theme.dart';
import 'package:dse_controle_app/app/core/theme/overrides/default_bottom_navigation_bar_theme.dart';
import 'package:dse_controle_app/app/core/theme/overrides/default_check_box_theme.dart';
import 'package:dse_controle_app/app/core/theme/overrides/default_elevated_buttom_theme.dart';
import 'package:dse_controle_app/app/core/theme/overrides/default_outlined_button_theme.dart';
import 'package:dse_controle_app/app/core/theme/overrides/default_tab_bar_theme.dart';
import 'package:dse_controle_app/app/core/theme/overrides/default_text_button_theme.dart';
import 'package:flutter/material.dart';

abstract class AppTheme {
  
  static final ThemeData lightTheme = ThemeData(
    primaryColor: AppColors.primary600,
    scaffoldBackgroundColor: AppColors.white,
    elevatedButtonTheme: DefaultElevatedButtonTheme.data,
    outlinedButtonTheme: DefaultOutlinedButtonTheme.data,
    textButtonTheme: DefaultTextButtonTheme.data,
    appBarTheme: DefaultAppBarTheme.data,
    bottomNavigationBarTheme: DefaultBottomNavigationBarTheme.data,
    checkboxTheme: DefaultCheckBoxTheme.data,
    tabBarTheme: DefaultTabBarTheme.data,
    sliderTheme: const SliderThemeData(
      thumbShape: RoundSliderThumbShape(enabledThumbRadius: 5),
      trackShape: RoundedRectSliderTrackShape(),
    ), 
    colorScheme: ColorScheme.fromSwatch(
      primarySwatch: const MaterialColor(
        0XFF2B3990,
        {
          50: AppColors.primary50,
          100: AppColors.primary100,
          200: AppColors.primary200,
          300: AppColors.primary300,
          400: AppColors.primary400,
          500: AppColors.primary600,
          600: AppColors.primary600,
          700: AppColors.primary700,
          800: AppColors.primary800,
          900: AppColors.primary700,
        }
      ),
      errorColor: AppColors.error700
    )
  );

  static final ThemeData darkTheme = ThemeData(
    primaryColor: AppColors.primary600,
    scaffoldBackgroundColor: AppColors.white,
    elevatedButtonTheme: DefaultElevatedButtonTheme.data,
    outlinedButtonTheme: DefaultOutlinedButtonTheme.data,
    textButtonTheme: DefaultTextButtonTheme.data,
    appBarTheme: DefaultAppBarTheme.data,
    bottomNavigationBarTheme: DefaultBottomNavigationBarTheme.data,
    checkboxTheme: DefaultCheckBoxTheme.data,
    tabBarTheme: DefaultTabBarTheme.data,
    sliderTheme: const SliderThemeData(
      thumbShape: RoundSliderThumbShape(enabledThumbRadius: 5),
      trackShape: RoundedRectSliderTrackShape(),
    ), 
    colorScheme: ColorScheme.fromSwatch(
      primarySwatch: const MaterialColor(
        0XFF2B3990, 
        {
          50: AppColors.primary50,
          100: AppColors.primary100,
          200: AppColors.primary200,
          300: AppColors.primary300,
          400: AppColors.primary400,
          500: AppColors.primary600,
          600: AppColors.primary600,
          700: AppColors.primary700,
          800: AppColors.primary800,
          900: AppColors.primary700,
        }
      ),
      errorColor: AppColors.error700,
    )
  );
}