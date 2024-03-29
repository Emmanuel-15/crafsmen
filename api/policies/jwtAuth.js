/**
 * JWT Auth Policy
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user via JWT token
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

const API_ERRORS = require('../constants/APIErrors');
const UserLogin = require('../models/UserLogin');
const TOKEN_RE = /^Bearer$/i;

module.exports = function (req, res, next) {
    let token = null;

    if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');

        if (parts.length === 2) {
            const scheme = parts[0];
            const credentials = parts[1];

            if (TOKEN_RE.test(scheme)) {
                token = credentials;
            }
        }
    } else {
        return res.badRequest(Utils.jsonErr('NO_AUTHORIZATINO_HEADER_FOUND'));
    }

    if (!token) {
        return res.badRequest(Utils.jsonErr('FORMAT_IS_AUTHORIZATION:BEARER_[TOKEN]'));
    }

    UserManager
        .authenticateUserByToken(token)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            switch (err) {
                case API_ERRORS.INACTIVE_TOKEN:
                case API_ERRORS.USER_NOT_FOUND:
                case API_ERRORS.USER_LOCKED:
                default:
                    return res.badRequest(Utils.jsonErr('INVALID_TOKEN'));
            }
        });
};