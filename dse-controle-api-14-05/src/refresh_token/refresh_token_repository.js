const sqlUtils = require("../utils/sqlUtils");

module.exports = class RefreshTokenRepository {

	static async create(refreshToken) {
		const { token, userId } = refreshToken;
		const result = await sqlUtils.executeQuery(`INSERT INTO refresh_token (token, usuario_id) VALUES ('${token}', ${userId})`);
		return result.insertId;
	}

	static async inactivate(id) {
		const result = await sqlUtils.executeQuery(`UPDATE refresh_token SET status = 'Inativo' WHERE id = ${id}`);
		return result.affectedRows > 0;
	}
	
	static async getByToken(refreshToken) {
		const result = await sqlUtils.executeQuery(`SELECT * FROM refresh_token WHERE token = '${refreshToken}' AND status = 'Ativo'`);
		return result[0] ?? null;
	}

	static async inactivateByUser(userId) {
		const result = await sqlUtils.executeQuery(`UPDATE refresh_token SET status = 'Inativo' WHERE usuario_id = ${userId}`);
		return result.affectedRows > 0;
	}

	static async inactivateByToken(refreshToken) {
		const result = await sqlUtils.executeQuery(`UPDATE refresh_token SET status = 'Inativo' WHERE token = '${refreshToken}'`);
		return result.affectedRows > 0;
	}

	static async deleteFromUser(userId) {
		const result = await sqlUtils.executeQuery(`DELETE FROM refresh_token WHERE usuario_id = ${userId}`);
		return result.affectedRows > 0;
	}
}