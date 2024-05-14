import 'package:dse_controle_app/app/data/api/api_result.dart';
import 'package:dse_controle_app/app/data/api/network_exceptions.dart';
import 'package:rox_client/rox_client.dart';

class LogRepository {
  final RoxClient auth;

  LogRepository(this.auth);

  Future<ApiResult<bool>> save(int userId, String zone, String message) async {
    try {
      Map<String, dynamic> data = {
        'userId': userId,
        'zone': zone,
        'message': message

      };
      Map<String, dynamic> response = await auth.post('/log/register', data: data);
      print(response);
      return const ApiResult.success(true);
    } catch (e) {
      return ApiResult.failure(NetworkExceptions.getDioException(e));
    }
  }
}
