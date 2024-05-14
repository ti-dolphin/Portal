import 'package:freezed_annotation/freezed_annotation.dart';

part 'recovery_password_model.freezed.dart';
part 'recovery_password_model.g.dart';

@freezed
class RecoveryPasswordModel with _$RecoveryPasswordModel {

  factory RecoveryPasswordModel({
    required String id,
    required String email,
    required String code
  }) = _RecoveryPasswordModel;

  factory RecoveryPasswordModel.fromJson(Map<String, dynamic> json) => _$RecoveryPasswordModelFromJson(json);
}