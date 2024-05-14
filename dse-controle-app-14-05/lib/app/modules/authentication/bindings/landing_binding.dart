import 'package:dse_controle_app/app/modules/authentication/controllers/landing_controller.dart';
import 'package:get/get.dart';

class LandingBinding implements Bindings {

  @override
  void dependencies() {
    Get.put<LandingController>(LandingController());
  }
}
