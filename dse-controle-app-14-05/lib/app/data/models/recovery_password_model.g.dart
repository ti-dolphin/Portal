// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recovery_password_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RecoveryPasswordModelImpl _$$RecoveryPasswordModelImplFromJson(
        Map<String, dynamic> json) =>
    _$RecoveryPasswordModelImpl(
      id: json['id'] as String,
      email: json['email'] as String,
      code: json['code'] as String,
    );

Map<String, dynamic> _$$RecoveryPasswordModelImplToJson(
        _$RecoveryPasswordModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'code': instance.code,
    };
