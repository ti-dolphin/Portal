
import 'package:get/get.dart';

class RouteService {
  static RouteService? _instance;
  RouteService._internal();

  static RouteService get instance {
    _instance ??= RouteService._internal();
    return _instance!;
  }

  final Rx<List<String>> _routes = Rx<List<String>>([]);

  List<String> get routes => _routes.value;

  String? get previousRoute =>
    routes.length > 1 ? routes[routes.length - 2] : null;  
  
  void addRoute(String route) {
    routes.add(route);
  }

  void removeRoute(String route) {
    routes.remove(route);
  }


}