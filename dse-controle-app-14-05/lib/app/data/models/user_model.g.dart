// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserModelImpl _$$UserModelImplFromJson(Map<String, dynamic> json) =>
    _$UserModelImpl(
      id: json['id'] as int,
      tipo: json['tipo'] as String,
      nome: json['nome'] as String,
      email: json['email'] as String,
      login: json['login'] as String,
      senha: json['senha'] as String,
      status: json['status'] as String,
    );

Map<String, dynamic> _$$UserModelImplToJson(_$UserModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tipo': instance.tipo,
      'nome': instance.nome,
      'email': instance.email,
      'login': instance.login,
      'senha': instance.senha,
      'status': instance.status,
    };
