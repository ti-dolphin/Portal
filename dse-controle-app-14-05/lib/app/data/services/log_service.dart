import 'package:dse_controle_app/app/data/api/api_result.dart';
import 'package:dse_controle_app/app/data/repositories/log_repository.dart';
import 'package:get/get.dart';

class LogService extends GetxService{
  late LogRepository logRepository;
  
  LogService(this.logRepository);

  Future<void> register(int userId, String zone, String message) async {
    ApiResult result = await logRepository.save(userId, zone, message);
    result.when(
      success: (data) => print('LOG SALVO: $userId, $zone, $message'),
      failure: (e) => print('ERRO AO SALVAR LOG: $userId, $zone, $message'),
    );
  }
}
