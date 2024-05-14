import 'package:dse_controle_app/app/data/api/api_result.dart';
import 'package:dse_controle_app/app/data/api/network_exceptions.dart';
import 'package:dse_controle_app/app/data/models/auth_token_model.dart';
import 'package:dse_controle_app/app/data/models/recovery_password_model.dart';
import 'package:dse_controle_app/app/data/models/user_model.dart';
import 'package:dse_controle_app/app/data/repositories/auth_repository.dart';
import 'package:dse_controle_app/app/data/services/notification_service.dart';
import 'package:dse_controle_app/app/data/services/token_service.dart';
import 'package:dse_controle_app/routes/app_routes.dart';
import 'package:get/get.dart';
import 'package:rox/widgets/snackbar/plannie_snack_bar.dart';

class UserService extends GetxService {
  final AuthRepository _authRepository;
  static UserService? _instance;
  Rx<UserModel?> userModelRx = Rx<UserModel?>(null);
  NotificationService _notificationService = Get.find<NotificationService>();

  UserService._internal({required AuthRepository authRepository}) : _authRepository = authRepository;

  static UserService get instance {
    if (_instance == null) {
      throw Exception('UserService não foi inicializado');
    }
    return _instance!;
  }

  static void init(AuthRepository authRepository) {
    _instance = UserService._internal(authRepository: authRepository);
  }

  static int get userId => UserService.instance.userModel?.id ?? 0;

  UserModel? get userModel => userModelRx.value;
  set userModel(UserModel? value) => userModelRx.value = value;

  Future<void> login(String login, String password) async {
    ApiResult<AuthTokenModel> result = await _authRepository.login(login, password);
    await result.when(
      success: (AuthTokenModel data) async {
        await TokenService.instance.setAccessToken(data.accessToken ?? '');
        await TokenService.instance.setRefreshToken(data.refreshToken ?? '');
        await getUserData();
      },
      failure: (e) {
        RoxSnackBar.showErrorSnackbar(NetworkExceptions.getErrorMessage(e));
      },
    );
  }

  Future<RecoveryPasswordModel?> recoveryPassword(String email) async {
    ApiResult<RecoveryPasswordModel?> result = await _authRepository.recoveryPassword(email);
    return result.when(
      success: (data) {
        return data;
      },
      failure: (e) {
        RoxSnackBar.showErrorSnackbar(NetworkExceptions.getErrorMessage(e));
        return null;
      },
    );
  }

  Future<bool> updatePassword(String id, String newPassword) async {
    ApiResult<bool> result = await _authRepository.updatePassword(id, newPassword);
    return result.when(
      success: (data) {
        RoxSnackBar.showSuccessSnackbar('Senha alterada com sucesso');
        return data;
      },
      failure: (e) {
        RoxSnackBar.showErrorSnackbar(NetworkExceptions.getErrorMessage(e));
        return false;
      },
    );
  }

  Future<bool?> verifyRegister(String email, String resgisterType) async {
    ApiResult<bool> result = await _authRepository.verifyRegister(email, resgisterType);
    return result.when(success: (data) {
      return data;
    }, failure: (e) {
      RoxSnackBar.showErrorSnackbar(NetworkExceptions.getErrorMessage(e));
      return null;
    });
  }

  Future<void> tryLoginWithCache() async {
    try {
      await getUserData();
    } catch (e) {
      Get.offAllNamed(AppRoutes.login);
    }
  }

  Future<bool> getUserData() async {
    ApiResult<UserModel> result = await _authRepository.getUserData();
    return result.when(success: (UserModel data) {
      userModel = data;
      _notificationService.subscribeToTopic('user_${data.id}');
      Get.offAllNamed(AppRoutes.home);
      return true;
    }, failure: (e) {
      userModel = null;
      Get.offAllNamed(AppRoutes.login);
      return false;
    });
  }

  Future<void> logout() async {
    _notificationService.unsubscribeFromTopic('user_$userId');
    _authRepository.logout();
    userModel = null;
    TokenService.instance.clearTokens();
    Get.offAllNamed(AppRoutes.login);
  }
}
