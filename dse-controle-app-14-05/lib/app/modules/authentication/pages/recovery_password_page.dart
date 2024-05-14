import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_logos.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:dse_controle_app/app/modules/authentication/controllers/recovery_password_controller.dart';
import 'package:dse_controle_app/app/widgets/textfields/app_text_field.dart';
import 'package:dse_controle_app/utils/validator_utils.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rox/widgets/page_wrapper/page_wrapper.dart';

class RecoveryPasswordPage extends GetView<RecoveryPasswordController> {
  const RecoveryPasswordPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(),
      body: PageWrapper(
        status: controller.status,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: controller.formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: Get.height * 0.20),
                Image.asset(AppLogos.dolphinLogo, height: AppSizes.iconSizeUnit56),
                const SizedBox(height: 32),
                const Text(
                  'Esqueceu sua senha?', 
                  textAlign: TextAlign.center, 
                  style: AppTextStyles.titleSmall
                ),
                const SizedBox(height: 24),
                Text(
                  'Por favor, insira o endereço de e-mail associado à sua conta e nós lhe enviaremos um código para redefinir sua senha.',
                  textAlign: TextAlign.center, 
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.neutral500)
                ),
                const SizedBox(height: 24),
                AppTextField(
                  controller: controller.emailController,
                  labelText: 'E-mail',
                  hintText: 'Endereço de e-mail',
                  keyboardType: TextInputType.emailAddress,
                  validator: ValidatorUtils.validateEmail,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: controller.onLogin,
                  child: Text('Enviar', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
