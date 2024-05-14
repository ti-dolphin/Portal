import 'dart:convert';

class ErrorModel {
  int statusCode;
  String? statusMessage;
  String? message;
  bool? success;

  ErrorModel({
    required this.statusCode,
    this.statusMessage,
    this.message,
    this.success,
  });
  
  ErrorModel copyWith({
    int? statusCode,
    String? statusMessage,
    String? message,
    bool? success,
  }) {
    return ErrorModel(
      statusCode: statusCode ?? this.statusCode,
      statusMessage: statusMessage ?? this.statusMessage,
      message: message ?? this.message,
      success: success ?? this.success,
    );
  }

  Map<String, dynamic> toMap() {
    Map<String, dynamic> result = <String, dynamic>{};
  
    result.addAll({'statusCode': statusCode});
    if(statusMessage != null){
      result.addAll({'statusMessage': statusMessage});
    }
    if(message != null){
      result.addAll({'message': message});
    }
    if(success != null){
      result.addAll({'success': success});
    }
  
    return result;
  }

  factory ErrorModel.fromMap(Map<String, dynamic> map) {
    return ErrorModel(
      statusCode: map['statusCode']?.toInt() ?? 0,
      statusMessage: map['statusMessage'],
      message: map['message'],
      success: map['success'],
    );
  }

  String toJson() => json.encode(toMap());

  factory ErrorModel.fromJson(String source) => ErrorModel.fromMap(json.decode(source));

  @override
  String toString() {
    return 'ErrorModel(statusCode: $statusCode, statusMessage: $statusMessage, message: $message, success: $success)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
  
    return other is ErrorModel &&
      other.statusCode == statusCode &&
      other.statusMessage == statusMessage &&
      other.message == message &&
      other.success == success;
  }

  @override
  int get hashCode {
    return statusCode.hashCode ^
      statusMessage.hashCode ^
      message.hashCode ^
      success.hashCode;
  }
}
