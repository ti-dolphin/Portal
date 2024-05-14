import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class AppIcon extends StatelessWidget {
  final String svgPath;
  final Color? color;
  final double size;
  final bool originalColor;

  const AppIcon({
    super.key,
    required this.svgPath,
    this.color,
    this.size = AppSizes.iconSizeUnit24,
    this.originalColor = false,
  });

  Color _getIconColor(BuildContext context) {
    IconThemeData iconTheme = IconTheme.of(context);
    return color ?? iconTheme.color ?? AppColors.neutral600;
  }

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      svgPath,
      colorFilter: originalColor ? null : ColorFilter.mode(_getIconColor(context), BlendMode.srcIn),
      height: size,
      width: size,
    );
  }
}
