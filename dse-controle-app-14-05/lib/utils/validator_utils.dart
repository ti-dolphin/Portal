
class ValidatorUtils {

  static String? validateUser(String? value) {
    if (value == null || value.isEmpty) {
      return 'Campo obrigatório';
    }
    return null;
  }
  
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Campo obrigatório';
    }
    if (!RegExp(r'^.+@[a-zA-Z]+\.{1}[a-zA-Z]+(\.{0,1}[a-zA-Z]+)$').hasMatch(value)) {
      return 'Email inválido';
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Campo obrigatório';
    }
    if (value.length < 8) {
      return 'Deve conter 8 ou mais caracteres';
    }
    // if (!RegExp('^(?=.*[A-Z])').hasMatch(value)) {
    //   return 'Deve conter pelo menos uma letra maiúscula';
    // }
    // if (!RegExp('^(?=.*[0-9])').hasMatch(value)) {
    //   return 'Deve conter pelo menos um número';
    // }
    return null;
  }

  static String? passwordMatch(String? value, String? valueToCompare) {
    if (value == null || value.isEmpty) {
      return 'Campo obrigatório';
    }
    if (value != valueToCompare) {
      return 'Senhas não coincidem';
    }
    return null;
  }

  static String? validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Campo obrigatório';
    }
    if (value.length < 2) {
      return 'Deve conter 2 ou mais caracteres';
    }
    if (!RegExp(r'^[a-zA-Z ]+$').hasMatch(value)) {
      return 'Deve conter apenas letras';
    }
    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Campo obrigatório';
    }
    if (!RegExp(r'^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$').hasMatch(value)) {
      return 'Telefone inválido';
    }
    return null;
  }
}
