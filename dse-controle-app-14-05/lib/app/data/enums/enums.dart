import 'package:json_annotation/json_annotation.dart';

enum RegisterOptions {
  @JsonValue('email') email,
  @JsonValue('google') google,
  @JsonValue('apple') apple
}

enum EditProfileOptions { phone, email, password }

enum NotificationOption {
  @JsonValue('week') week,
  @JsonValue('fifteenDays') fifteenDays,
  @JsonValue('month') month,
}

enum NotificationEventType { foreground, background, open, initialMessage }
