import 'dart:convert';

class AuthTokenModel {
  String? accessToken;
  String? refreshToken;

  AuthTokenModel({
    this.accessToken,
    this.refreshToken,
  });

  AuthTokenModel copyWith({
    String? accessToken,
    String? refreshToken,
  }) {
    return AuthTokenModel(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }

  Map<String, dynamic> toMap() {
    Map<String, dynamic> result = {};
  
    if(accessToken != null){
      result.addAll({'accessToken': accessToken});
    }
    if(refreshToken != null){
      result.addAll({'refreshToken': refreshToken});
    }
  
    return result;
  }

  factory AuthTokenModel.fromMap(Map<String, dynamic> map) {
    return AuthTokenModel(
      accessToken: map['accessToken'],
      refreshToken: map['refreshToken'],
    );
  }

  String toJson() => json.encode(toMap());

  factory AuthTokenModel.fromJson(String source) => AuthTokenModel.fromMap(json.decode(source));

  @override
  String toString() => 'AuthTokenModel(accessToken: $accessToken, refreshToken: $refreshToken)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
  
    return other is AuthTokenModel &&
      other.accessToken == accessToken &&
      other.refreshToken == refreshToken;
  }

  @override
  int get hashCode => accessToken.hashCode ^ refreshToken.hashCode;
}
