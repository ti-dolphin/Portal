// File generated by FlutterFire CLI.
// ignore_for_file: lines_longer_than_80_chars, avoid_classes_with_only_static_members
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyD_9bx28Cv9fzDGwA9O1v2fQKXcTlli6H0',
    appId: '1:1036068230317:web:266fee36cbdf0697b9e224',
    messagingSenderId: '1036068230317',
    projectId: 'fir-dolphin-d3ced',
    authDomain: 'fir-dolphin-d3ced.firebaseapp.com',
    storageBucket: 'fir-dolphin-d3ced.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBhkJtNVqdRlcYySiyVOxvps8hXAgYhnKQ',
    appId: '1:1036068230317:android:e37499e454e3b26ab9e224',
    messagingSenderId: '1036068230317',
    projectId: 'fir-dolphin-d3ced',
    storageBucket: 'fir-dolphin-d3ced.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDcCipPF7VvR0gqUlutJrEf_aD-zsjEzvU',
    appId: '1:1036068230317:ios:2933f1f0bec8007db9e224',
    messagingSenderId: '1036068230317',
    projectId: 'fir-dolphin-d3ced',
    storageBucket: 'fir-dolphin-d3ced.appspot.com',
    iosBundleId: 'br.com.controle.dolphin',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyDcCipPF7VvR0gqUlutJrEf_aD-zsjEzvU',
    appId: '1:1036068230317:ios:77c9d831b4465ee5b9e224',
    messagingSenderId: '1036068230317',
    projectId: 'fir-dolphin-d3ced',
    storageBucket: 'fir-dolphin-d3ced.appspot.com',
    iosBundleId: 'br.com.controle.dolphin.RunnerTests',
  );
}
