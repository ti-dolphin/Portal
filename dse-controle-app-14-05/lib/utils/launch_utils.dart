import 'package:rox/widgets/snackbar/plannie_snack_bar.dart';
import 'package:url_launcher/url_launcher.dart';

class LaunchUtils {

  static Future<void> launch(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    } else {
      RoxSnackBar.showErrorSnackbar('Não foi possivel acessar a url');
    }
  }
}