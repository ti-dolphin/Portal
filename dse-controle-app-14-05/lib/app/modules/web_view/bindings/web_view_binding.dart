
import 'package:dse_controle_app/app/modules/web_view/controllers/webview_controller.dart';
import 'package:get/get.dart';

class WebViewBinding implements Bindings {

  @override
  void dependencies() {
    Get.put<WVController>(WVController());
  }
}
