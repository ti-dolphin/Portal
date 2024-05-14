const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
require('../../../config');

module.exports = class AuthUtils {

    static createAccessToken(user) {
        delete user['iat']
        const accessToken = jwt.sign(AuthUtils.#formatUserToToken(user), CREDENTIALS.ACCESS_TOKEN_SECRET, { expiresIn: '7d' }) // Voltar para 30min assim que melhorar a manipulação de tokens
        return accessToken;
    }

    static createRefreshToken(user) {
        delete user['iat'];
        return jwt.sign(AuthUtils.#formatUserToToken(user), CREDENTIALS.REFRESH_TOKEN_SECRET);
    }

    static #formatUserToToken(user) {
        return {
            id: user.id,
            admin: user.admin,
        }
    }

    static getHash(password) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    static compareHash(password, hash) {
        return bcrypt.compareSync(password, hash);
    }

    static getDataFromAuthHeader(authHeader) {
        const base64 = authHeader.split(' ')[1];
        const auth = Buffer.from(base64, 'base64').toString('ascii');
        const email = auth.split(':')[0];
        const password = auth.split(':')[1];
        return { email, password };
    }
}