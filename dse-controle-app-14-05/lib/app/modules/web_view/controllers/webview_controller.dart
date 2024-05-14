import 'package:dse_controle_app/app/core/consts.dart';
import 'package:dse_controle_app/app/data/services/token_service.dart';
import 'package:dse_controle_app/app/data/services/user_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:get/get.dart';

class WVController extends GetxController {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? webViewController;
  InAppWebViewSettings sharedSettings = InAppWebViewSettings(
    useOnDownloadStart: true,
    allowFileAccess: true,
    supportMultipleWindows: false,
    javaScriptCanOpenWindowsAutomatically: true,
    applicationNameForUserAgent: 'My PWA App Name',
    userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.105 Mobile Safari/537.36',
    disableDefaultErrorPage: true,
    limitsNavigationsToAppBoundDomains: true,
  );
  String url = '${Consts.panelUrl}?accessToken=${TokenService.instance.accessToken}&refreshToken=${TokenService.instance.refreshToken}';

  WVController();

  void onWebViewCreated(InAppWebViewController controller) {
    webViewController = controller;
  }

  void onLoadStart(InAppWebViewController controller, WebUri? url) {
    print('Página carregando: $url');
    if (url.toString().contains('${Consts.panelUrl}/login')) {
      UserService.instance.logout();
    }
  }

  Future<bool> onPopInvoked(bool didPop) async {
    bool canGoBack = await webViewController!.canGoBack();
    if (canGoBack) {
      webViewController!.goBack();
      return false;
    }
    return true;
  }
}
