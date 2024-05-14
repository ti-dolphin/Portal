const jwt = require('jsonwebtoken');
const ErrorHandler = require("../error_handler/error_handler");
const { MissingTokenError, InvalidTokenError } = require("../error_handler/errors");
require('../../../config');

module.exports = class Auth {

    static authenticateToken(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token == null) throw MissingTokenError;

            jwt.verify(token, CREDENTIALS.ACCESS_TOKEN_SECRET, (error, user) => {
                if (error) {
                    throw InvalidTokenError;
                } else {
                    req.user = user;
                }
                next();
            });
        } catch (error) {
            ErrorHandler.resolveError(res, error);
        }
    }

    static authenticateRefreshToken(req, res, next) {
        try {
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1]
            if (token == null) throw MissingTokenError;

            jwt.verify(token, CREDENTIALS.REFRESH_TOKEN_SECRET, (error, user) => {
                if (error) {
                    throw InvalidTokenError;
                } else {
                    req.refreshToken = token;
                    req.user = user;
                }
                next();
            })
        } catch (error) {
            ErrorHandler.resolveError(res, error);
        }
    }

    static getAuthFromHeader(req, res, next) {
        try {
            if (req.headers.authorization) {
                const base64 = req.headers.authorization.split(' ')[1];
                const auth = Buffer.from(base64, 'base64').toString('ascii');
                const parts = auth.split(':');
                if (parts.length === 2) {
                    req.body.login = parts[0];
                    req.body.password = parts[1];
                } else {
                    throw res.status(401).json({ message: "Invalid authorization header" });
                }
                next();
            }
        } catch (error) {
            ErrorHandler.resolveError(res, error);
        }
    }
}