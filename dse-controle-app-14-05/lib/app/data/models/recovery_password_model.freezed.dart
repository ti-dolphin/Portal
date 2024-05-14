// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recovery_password_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

RecoveryPasswordModel _$RecoveryPasswordModelFromJson(
    Map<String, dynamic> json) {
  return _RecoveryPasswordModel.fromJson(json);
}

/// @nodoc
mixin _$RecoveryPasswordModel {
  String get id => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $RecoveryPasswordModelCopyWith<RecoveryPasswordModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecoveryPasswordModelCopyWith<$Res> {
  factory $RecoveryPasswordModelCopyWith(RecoveryPasswordModel value,
          $Res Function(RecoveryPasswordModel) then) =
      _$RecoveryPasswordModelCopyWithImpl<$Res, RecoveryPasswordModel>;
  @useResult
  $Res call({String id, String email, String code});
}

/// @nodoc
class _$RecoveryPasswordModelCopyWithImpl<$Res,
        $Val extends RecoveryPasswordModel>
    implements $RecoveryPasswordModelCopyWith<$Res> {
  _$RecoveryPasswordModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? email = null,
    Object? code = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      code: null == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RecoveryPasswordModelImplCopyWith<$Res>
    implements $RecoveryPasswordModelCopyWith<$Res> {
  factory _$$RecoveryPasswordModelImplCopyWith(
          _$RecoveryPasswordModelImpl value,
          $Res Function(_$RecoveryPasswordModelImpl) then) =
      __$$RecoveryPasswordModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String id, String email, String code});
}

/// @nodoc
class __$$RecoveryPasswordModelImplCopyWithImpl<$Res>
    extends _$RecoveryPasswordModelCopyWithImpl<$Res,
        _$RecoveryPasswordModelImpl>
    implements _$$RecoveryPasswordModelImplCopyWith<$Res> {
  __$$RecoveryPasswordModelImplCopyWithImpl(_$RecoveryPasswordModelImpl _value,
      $Res Function(_$RecoveryPasswordModelImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? email = null,
    Object? code = null,
  }) {
    return _then(_$RecoveryPasswordModelImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      code: null == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RecoveryPasswordModelImpl implements _RecoveryPasswordModel {
  _$RecoveryPasswordModelImpl(
      {required this.id, required this.email, required this.code});

  factory _$RecoveryPasswordModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$RecoveryPasswordModelImplFromJson(json);

  @override
  final String id;
  @override
  final String email;
  @override
  final String code;

  @override
  String toString() {
    return 'RecoveryPasswordModel(id: $id, email: $email, code: $code)';
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecoveryPasswordModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.code, code) || other.code == code));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, email, code);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$RecoveryPasswordModelImplCopyWith<_$RecoveryPasswordModelImpl>
      get copyWith => __$$RecoveryPasswordModelImplCopyWithImpl<
          _$RecoveryPasswordModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RecoveryPasswordModelImplToJson(
      this,
    );
  }
}

abstract class _RecoveryPasswordModel implements RecoveryPasswordModel {
  factory _RecoveryPasswordModel(
      {required final String id,
      required final String email,
      required final String code}) = _$RecoveryPasswordModelImpl;

  factory _RecoveryPasswordModel.fromJson(Map<String, dynamic> json) =
      _$RecoveryPasswordModelImpl.fromJson;

  @override
  String get id;
  @override
  String get email;
  @override
  String get code;
  @override
  @JsonKey(ignore: true)
  _$$RecoveryPasswordModelImplCopyWith<_$RecoveryPasswordModelImpl>
      get copyWith => throw _privateConstructorUsedError;
}
