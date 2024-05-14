
import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppTextField extends StatelessWidget {
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final Widget? suffix;
  final String? labelText;
  final TextEditingController? controller;
  final TextInputType? keyboardType;
  final bool? obscureText;
  final bool? enabled;
  final bool? readOnly;
  final Function(String)? onChanged;
  final Function(String)? onSubmitted;
  final Function()? onTap;
  final Function()? onEditingComplete;
  final Function(String)? onFieldSubmitted;
  final Function(String?)? onSaved;
  final String? Function(String?)? validator;
  final FloatingLabelBehavior floatingLabelBehavior;
  final String? hintText;
  final TextCapitalization textCapitalization;
  final FocusNode? focusNode;
  final List<TextInputFormatter> inputFormaters;
  final Color fillColor;

  const AppTextField({
    super.key, 
    this.prefixIcon, 
    this.suffixIcon,
    this.suffix,
    this.labelText, 
    this.controller, 
    this.keyboardType, 
    this.obscureText, 
    this.enabled, 
    this.readOnly, 
    this.onChanged,
    this.onSubmitted, 
    this.onTap, 
    this.onEditingComplete,
    this.onFieldSubmitted, 
    this.onSaved, 
    this.validator,
    this.hintText,
    this.floatingLabelBehavior = FloatingLabelBehavior.auto,
    this.textCapitalization = TextCapitalization.none,
    this.focusNode,
    this.inputFormaters = const [],
    this.fillColor = Colors.transparent,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      inputFormatters: inputFormaters,
      controller: controller,
      onChanged: onChanged,
      onTap: onTap,
      onEditingComplete: onEditingComplete,
      onFieldSubmitted: onFieldSubmitted,
      validator: validator,
      onSaved: onSaved,
      readOnly: readOnly ?? false,
      keyboardType: keyboardType,
      obscureText: obscureText ?? false,
      enabled: enabled,
      cursorColor: AppColors.primary600,
      cursorWidth: 1,
      textCapitalization: textCapitalization,
      focusNode: focusNode,
      decoration: InputDecoration(
        errorStyle: AppTextStyles.bodySmall.copyWith(color: AppColors.error700),
        isDense: true,
        floatingLabelBehavior: floatingLabelBehavior,
        labelText: labelText,
        hintText: hintText,
        focusColor: AppColors.primary600,
        fillColor: fillColor,
        filled: true,
        errorMaxLines: 2,
        contentPadding: const EdgeInsets.symmetric(
          vertical: AppSizes.spacingUnit16,
          horizontal: AppSizes.spacingUnit16,
        ),
        prefixIcon: prefixIcon,
        prefixIconColor: AppColors.neutral600,
        suffixIcon: suffixIcon,
        suffixIconColor: AppColors.neutral600,
        suffix: suffix,
        border: const OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.neutral200),
          borderRadius: BorderRadius.all(Radius.circular(AppSizes.radiusUnit8)),
        ),
        enabledBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.neutral200),
          borderRadius: BorderRadius.all(Radius.circular(AppSizes.radiusUnit8)),
        ),
        disabledBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.neutral400),
          borderRadius: BorderRadius.all(Radius.circular(AppSizes.radiusUnit8)),
        ),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.primary600),
          borderRadius: BorderRadius.all(Radius.circular(AppSizes.radiusUnit8)),
        ), 
        errorBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.error700),
          borderRadius: BorderRadius.all(Radius.circular(AppSizes.radiusUnit8)),
        ),
        focusedErrorBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.error700),
          borderRadius: BorderRadius.all(Radius.circular(AppSizes.radiusUnit8)),
        )
      )
    );
  }
}