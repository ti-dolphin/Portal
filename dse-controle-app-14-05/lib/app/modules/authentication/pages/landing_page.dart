
import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_logos.dart';
import 'package:dse_controle_app/app/modules/authentication/controllers/landing_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LandingPage extends GetView<LandingController> {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(color: AppColors.white),
      child: Center(
        child: Image.asset(
          AppLogos.dolphinLogo,
          width: 120,
          height: 40,
        ),
      ),
    );
  }
}
