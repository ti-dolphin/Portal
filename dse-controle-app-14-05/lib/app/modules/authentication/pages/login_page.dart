import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_logos.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:dse_controle_app/app/modules/authentication/controllers/login_controller.dart';
import 'package:dse_controle_app/app/widgets/textfields/app_text_field.dart';
import 'package:dse_controle_app/utils/validator_utils.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rox/widgets/page_wrapper/page_wrapper.dart';

class LoginPage extends GetView<LoginController> {
  const LoginPage({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageWrapper(
        status: controller.status,
        child:SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: controller.formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: Get.height * 0.20),
                Image.asset(AppLogos.dolphinLogo, height: AppSizes.iconSizeUnit56),
                const SizedBox(height: 32),
                AppTextField(
                  controller: controller.emailController,
                  labelText: 'Usuário',
                  hintText: 'Digite o seu usuário',
                  keyboardType: TextInputType.emailAddress,
                  validator: ValidatorUtils.validateUser,
                ),
                const SizedBox(height: 16),
                Obx(() => AppTextField(
                  controller: controller.passwordController,
                  labelText: 'Senha',
                  hintText: 'Digite sua senha de acesso',
                  obscureText: controller.obscureText.value,
                  validator: ValidatorUtils.validatePassword,
                )),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Spacer(),
                    TextButton(
                      onPressed: controller.forgotPassword, 
                      child: Text('Esqueceu sua senha?', style: AppTextStyles.bodyMedium.copyWith(fontSize: 12, color: AppColors.primary400)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: controller.onLogin,
                  child:  Text('Autenticar', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white, fontWeight: FontWeight.bold)),
                ),
                SizedBox(height: Get.height * 0.15),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
