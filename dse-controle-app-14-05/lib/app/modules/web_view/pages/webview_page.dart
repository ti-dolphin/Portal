import 'package:dse_controle_app/app/modules/web_view/controllers/webview_controller.dart';
import 'package:dse_controle_app/utils/launch_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:get/get.dart';

class WebViewPage extends GetView<WVController> {
  const WebViewPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      onPopInvoked: controller.onPopInvoked,
      child: Scaffold(
        body: SafeArea(
          child: InAppWebView(
            initialUrlRequest: URLRequest(url: WebUri(controller.url)),
            onDownloadStartRequest: (controller, downloadStartRequest){
              LaunchUtils.launch(downloadStartRequest.url.rawValue);
            },
            initialSettings: controller.sharedSettings,
            onWebViewCreated: controller.onWebViewCreated,
            onLoadStart: controller.onLoadStart,
          ),
        ),
      ),
    );
  }
}
