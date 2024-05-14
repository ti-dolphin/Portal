import 'package:dse_controle_app/app/core/theme/app_colors.dart';
import 'package:dse_controle_app/app/core/theme/app_logos.dart';
import 'package:dse_controle_app/app/core/theme/app_sizes.dart';
import 'package:dse_controle_app/app/core/theme/app_text_styles.dart';
import 'package:dse_controle_app/app/modules/authentication/controllers/new_password_controller.dart';
import 'package:dse_controle_app/app/widgets/textfields/app_text_field.dart';
import 'package:dse_controle_app/utils/validator_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:pin_input_text_field/pin_input_text_field.dart';
import 'package:rox/widgets/page_wrapper/page_wrapper.dart';

class NewPasswordPage extends GetView<NewPasswordController> {
  const NewPasswordPage({super.key});

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
                Text(
                  'Enviamos um e-mail de confirmação de 6 dígitos para o seu e-mail ${controller.emailController.text}', 
                  textAlign: TextAlign.center, 
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.neutral500)
                ),
                const SizedBox(height: 24),
                Text(
                  'Por favor, insira o código na caixa abaixo.',
                  textAlign: TextAlign.center, 
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.neutral500)
                ),
                const SizedBox(height: 24),
                PinInputTextField(
                  decoration: BoxLooseDecoration(
                    strokeColorBuilder: PinListenColorBuilder(AppColors.primary500, AppColors.neutral400),
                    bgColorBuilder: PinListenColorBuilder(AppColors.white, AppColors.white),
                    textStyle: AppTextStyles.titleMedium,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly
                  ],
                  autocorrect: true,
                  autoFocus: true,
                  textInputAction: TextInputAction.go,
                  onChanged: (value) => controller.validaToken(value, context),
                ),
                const SizedBox(height: 4),
                Obx(() => controller.hasCodeError.value 
                  ? Text('Código inválido', style: AppTextStyles.bodySmall.copyWith(color: AppColors.error500))
                  : const SizedBox.shrink()
                ),
                const SizedBox(height: 48),
                Text(
                  'Insira sua nova senha',
                  textAlign: TextAlign.center, 
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.neutral500)
                ),
                const SizedBox(height: 16),
                Obx(() => AppTextField(
                  controller: controller.passwordController1,
                  labelText: 'Senha',
                  hintText: 'Digite sua nova senha',
                  obscureText: controller.obscureText.value,
                  validator: ValidatorUtils.validatePassword,
                  focusNode: controller.focusNode,
                )),
                const SizedBox(height: 16),
                Obx(() => AppTextField(
                  controller: controller.passwordController2,
                  labelText: 'Confirme a senha',
                  hintText: 'Digite sua nova senha',
                  obscureText: controller.obscureText.value,
                  validator: ValidatorUtils.validatePassword,
                )),
                const SizedBox(height: 48),
                Obx(() => ElevatedButton(
                  onPressed: controller.isEnabledButton.value ? controller.updatePassword : null,
                  child: Text('Enviar', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white, fontWeight: FontWeight.bold)),
                )),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
