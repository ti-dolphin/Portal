import 'dart:convert';
import 'package:dse_controle_app/app/data/api/api_result.dart';
import 'package:dse_controle_app/app/data/api/network_exceptions.dart';
import 'package:dse_controle_app/app/data/models/auth_token_model.dart';
import 'package:dse_controle_app/app/data/models/recovery_password_model.dart';
import 'package:dse_controle_app/app/data/models/user_model.dart';
import 'package:rox_client/rox_client.dart';

class AuthRepository {
  final RoxClient auth;
  final RoxClient client;

  AuthRepository(this.auth, this.client);

  Future<ApiResult<AuthTokenModel>> login(String login, String password) async {
    try {
      var response = await client.get('/auth/login',
        options: RoxClientOptions(
          headers: {
            'authorization':'Bearer ${base64Encode(utf8.encode('$login:$password'))}',
          }
        )
      );
      return ApiResult.success(AuthTokenModel(
        accessToken: response['accessToken'],
        refreshToken: response['refreshToken'],
      ));
    } catch (e) {
      return ApiResult.failure(NetworkExceptions.getDioException(e));
    }
  }

  Future<ApiResult<bool>> verifyRegister(String email, String registerType) async {
    try {
      var response = await auth.get('/auth/verifyRegister/$email/$registerType');
      return ApiResult.success(response ?? false);
    } catch (e) {
      return ApiResult.failure(NetworkExceptions.getDioException(e));
    }
  }

  Future<ApiResult<UserModel>> getUserData() async {
    try {
      var response = await auth.get('/usuario/getUserData');
      return ApiResult.success(UserModel.fromJson(response));
    } catch (e) {
      return ApiResult.failure(NetworkExceptions.getDioException(e));
    }
  }

  Future<ApiResult<bool>> logout() async {
    try {
      await auth.post('/auth/logout');
      return const ApiResult.success(true);
    } catch (e) {
      return ApiResult.failure(NetworkExceptions.getDioException(e));
    }
  }

  Future<ApiResult<RecoveryPasswordModel>> recoveryPassword(String email) async {
    try {
      var response = await auth.get('/auth/recoveryPassword/$email');
      return ApiResult.success(RecoveryPasswordModel.fromJson(response));
    } catch (e) {
      return ApiResult.failure(NetworkExceptions.getDioException(e));
    }
  }

  Future<ApiResult<bool>> updatePassword(String id, String newPassword) async {
    try {
      Map<String, dynamic> data = {
        'id': id, 
        'senha': newPassword
      };
      await auth.post('/usuario/updatePassword', data: data);
      return const ApiResult.success(true);
    } catch (e) {
      return ApiResult.failure(NetworkExceptions.getDioException(e));
    }
  }
}
