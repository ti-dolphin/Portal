import 'package:dse_controle_app/app/core/theme/app_theme.dart';
import 'package:dse_controle_app/app/modules/not_found/not_found_page.dart';
import 'package:dse_controle_app/initializer.dart';
import 'package:dse_controle_app/routes/app_pages.dart';
import 'package:dse_controle_app/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

Future main() async {
  await Initializer.init();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Dolphin',
      theme: AppTheme.lightTheme,
      initialRoute: AppRoutes.landing,
      getPages: AppPages.pages,
      debugShowCheckedModeBanner: false,
      unknownRoute: GetPage(
        name: AppRoutes.notFound, 
        page: () => const NotFoundPage()
      ),
    );
  }
}
