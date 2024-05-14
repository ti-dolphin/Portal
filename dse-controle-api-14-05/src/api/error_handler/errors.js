const ErrorModel = require("./error_model");

const NonExistentUserError = new ErrorModel(404, 'Usuário não existe');
const IncorrectPasswordError = new ErrorModel(401, 'Usuário ou senha incorretos');
const UserAlreadyRegisteredError = new ErrorModel(400, 'Cadastro já realizado');
const EmailAlreadyRegisteredError = new ErrorModel(400, 'Email já cadastrado');
const EmailAlreadyRegisteredInOtherOptionError = new ErrorModel(400, 'E-mail já utilizado em outra opção de acesso.');
const InvalidTokenError = new ErrorModel(401, 'Token inválido');
const ForbiddenTokenError = new ErrorModel(403, 'Token inativo');
const MissingTokenError = new ErrorModel(401, 'Token não informado');
const InvalidUserFormat = new ErrorModel(400, 'Usuário inválido');

module.exports = { 
	UserAlreadyRegisteredError,
	EmailAlreadyRegisteredError,
	EmailAlreadyRegisteredInOtherOptionError,
	NonExistentUserError,
	IncorrectPasswordError,
	InvalidTokenError,
	ForbiddenTokenError,
	MissingTokenError,
	InvalidUserFormat 
};