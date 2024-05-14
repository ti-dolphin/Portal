import 'package:dse_controle_app/app/data/services/user_service.dart';
import 'package:get/get.dart';
import 'package:rox/mixins/fetch_data_mixin.dart';

class LandingController extends GetxController with FetchDataMixin {
  
  @override
  void onInit() {
    tryLoginWithCache();
    super.onInit();
  }

  Future tryLoginWithCache() async {
    await UserService.instance.tryLoginWithCache();
  }
}
