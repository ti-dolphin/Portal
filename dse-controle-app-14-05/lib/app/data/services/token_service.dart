import 'package:dse_controle_app/app/data/models/auth_token_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TokenService {
  String? accessToken;
  String? refreshToken;

  static TokenService? _instance;
  TokenService._internal({required this.accessToken, required this.refreshToken});

  static TokenService get instance{
    if(_instance == null){
      throw Exception('TokenService não foi inicializado');
    }
    return _instance!;
  }

  static Future<void> init() async {
    AuthTokenModel? authTokenModel = await TokenService.loadTokens();
    _instance = TokenService._internal(
      accessToken: authTokenModel?.accessToken,
      refreshToken: authTokenModel?.refreshToken,
    );
  }

  // Pega os tokens da cache
  static Future<AuthTokenModel?> loadTokens() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? accessToken = prefs.getString('accessToken');
    String? refreshToken = prefs.getString('refreshToken');
    if (accessToken != null && refreshToken != null) {
      return AuthTokenModel(accessToken: accessToken, refreshToken: refreshToken);
    }else{
      return null;
    }
  }

  Future<String> getAccessToken() async {
    return accessToken ?? '';
  }

  Future<String> getRefreshToken() async {
    return refreshToken ?? '';
  }

  Future setAccessToken(String newToken) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString('accessToken', newToken);
    accessToken = newToken;
  }

  Future setRefreshToken(String newToken) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString('refreshToken', newToken);
    refreshToken = newToken;
  }

  Future clearTokens() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.remove('accessToken');
    prefs.remove('refreshToken');
    accessToken = null;
    refreshToken = null;
  }
}