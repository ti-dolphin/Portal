const { IncorrectPasswordError, NonExistentUserError, ForbiddenTokenError } = require("../api/error_handler/errors");
const AuthUtils = require("../api/middlewares/auth_utils");
const Comunicacao = require("../comunicacao/comunicacao");
const RefreshTokenRepository = require("../refresh_token/refresh_token_repository");
const Usuario = require("../usuario/usuario");
const Utils = require("../utils/utils");

module.exports = class AuthService {

	static async getNewToken(user, refreshToken) {
		try {
			const token = await RefreshTokenRepository.getByToken(refreshToken);
			if (!token) throw ForbiddenTokenError;
			const accessToken = AuthUtils.createAccessToken(user);
			return { accessToken: accessToken, refreshToken: refreshToken };
		} catch (error) {
			throw error;
		}
	}

	static async login(login, password) {
		try {
			const user = await Usuario.getByLogin(login);
			if (user) {
				const hash = (user.senha).replace(/^\$2y(.+)$/i, '$2a$1');
				const isSamePassword = AuthUtils.compareHash(password, hash);
				if (isSamePassword) {
					const accessToken = AuthUtils.createAccessToken(user);
					const refreshToken = AuthUtils.createRefreshToken(user);
					await RefreshTokenRepository.create({ token: refreshToken, userId: user.id });
					await Usuario.simpleUpdate({ id: user.id, data_acesso: Utils.dateTimeAtual() });
					return { accessToken: accessToken, refreshToken: refreshToken };
				} else {
					throw IncorrectPasswordError;
				}
			} else {
				throw NonExistentUserError;
			}
		} catch (error) {
			throw error;
		}
	}

	static async recoveryPassword(email) {
		try {
			const user = await Usuario.getUserByEmail(email)
			if (user) {
				let code = '';
				for (let index = 0; index < 6; index++) {
					code += Math.floor(Math.random() * 10).toString()
				}
				const titulo = "Código para recuperação de senha - Portal Dolphin"
				const message = `O seu código para cadastro de nova senha no Portal Dolphin é: ${code}`
				Comunicacao.sendNodemailerEmail(email, titulo, message, "PORTAL DOLPHIN")
				return { id: user.id.toString(), email: user.email, code: code };
			} else {
				throw NonExistentUserError;
			}
		} catch (error) {
			throw error;
		}
	}

	static async logout(refreshToken) {
		try {
			return await RefreshTokenRepository.inactivateByToken(refreshToken);
		} catch (error) {
			throw error;
		}
	}
}