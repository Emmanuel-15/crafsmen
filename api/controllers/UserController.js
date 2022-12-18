/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const API_ERRORS = require('../constants/APIErrors');
const validator = require('validator');
const passValidator = require('password-validator');
const UserLogin = require('../models/UserLogin');
const UserManager = require('../services/UserManager');

const TOKEN_RE = /^Bearer$/i;

const passSchema = new passValidator();
const passMinLen = 6;
const passMaxLen = 24;

// Scheme for password validation
// See ref https://github.com/tarunbatra/password-validator
passSchema
    .is().min(passMinLen)
    .is().max(passMaxLen)
    .has().letters()
    .has().digits();

module.exports = {

    /**
     * Action for /user
     * @param req
     * @param res
     */
    index: function (req, res) {
        // We use here req.userInfo which is set in policies/jwtAuth.js
        res.ok({
            id: req.userInfo.id,
            email: req.userInfo.email
        });
    },

    /**
     * Action for /user/create
     * @param req
     * @param res
     * @returns {*}
     */
    create: function (req, res) {
        if (!req.body || _.keys(req.body).length <= 0)
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));

        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const passwordConfirm = req.body.password_confirm;

        if (!email || !validator.isEmail(email))
            return res.badRequest(Utils.jsonErr('INVALID_EMAIL'));


        if (password !== passwordConfirm)
            return res.badRequest(Utils.jsonErr('PASSWORD_DOES_NOT_MATCH'));


        if (!passSchema.validate(password))
            return res.badRequest(Utils.jsonErr('PASSWORD_MUST_BE_6-24_CHARACTERS_INCLUDING_LETTERS_AND_DIGITS'));


        UserManager
            .createUser({
                email,
                username,
                password
            })
            .then(jwToken => {
                res.created('USER_CREATED_SUCCESSFULLY', jwToken);
            })
            .catch(err => {
                if (err == API_ERRORS.USERNAME_IN_USE) {
                    return res.badRequest(Utils.jsonErr('THIS_USERNAME_IS_ALREADY_IN_USE'));

                } else if (err === API_ERRORS.EMAIL_IN_USE) {
                    return res.badRequest(Utils.jsonErr('THIS_EMAIL_IS_ALREADY_IN_USE'));

                } else if (err === API_ERRORS.EXCEPTION) {
                    return res.serverError(Utils.jsonErr("EXCEPTION"));

                } else {
                    return res.serverError(Utils.jsonErr(err));
                }
            });
    },

    /**
     * Action for /user/login
     * @param req
     * @param res
     * @returns {*}
     */
    login: async function (req, res) {
        if (!req.body || _.keys(req.body).length <= 0)
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));


        const username = req.body.username;
        const password = req.body.password;

        let isEmail = false;

        if (!password)
            return res.badRequest(Utils.jsonErr('PASSWORD_IS_REQUIRED'));


        if (validator.isEmail(username))
            isEmail = true;


        if (isEmail) {
            // User has provided the email as username.
            if (!username || !validator.isEmail(username))
                return res.badRequest(Utils.jsonErr('INVALID_EMAIL'));
        }

        await UserManager
            .authenticateUserByPassword(username, password, isEmail)
            .then((token) => {
                return res.ok('USER_TOKEN', token);
            })
            .catch(err => {
                switch (err) {
                    case API_ERRORS.INVALID_EMAIL_PASSWORD:
                        return res.badRequest(Utils.jsonErr('INVALID_EMAIL_OR_PASSWORD'));
                    case API_ERRORS.USER_NOT_FOUND:
                        return res.badRequest(Utils.jsonErr('INVALID_EMAIL_OR_PASSWORD'));
                    case API_ERRORS.USER_LOCKED:
                        return res.forbidden(Utils.jsonErr('ACCOUNT_LOCKED'));
                    case API_ERRORS.EXCEPTION:
                        return res.serverError(Utils.jsonErr("EXCEPTION"));
                    default:
                        /* istanbul ignore next */
                        return res.serverError(Utils.jsonErr(err));
                }
            });

    },

    /**
     * Action for /user/token
     * @param req
     * @param res
     * @returns {*}
     */

    refreshToken: function (req, res) {
        if (req.headers && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');

            if (parts.length === 2) {
                const scheme = parts[0];
                const credentials = parts[1];
                token = credentials;
            }
        } else {
            return res.badRequest(Utils.jsonErr('NO_AUTHORIZATION_HEADER_FOUND'));
        }

        if (!token)
            return res.badRequest(Utils.jsonErr('FORMAT_IS_AUTHORIZATION:BEARER_[TOKEN]'));

        UserManager
            .authenticateUserByRefreshToken(token)
            .then(user => {
                UserManager._generateToken(user, token => {
                    return res.ok('USER_TOKEN', { token });
                });
            })
            .catch(err => {
                switch (err) {
                    case API_ERRORS.INVALID_EMAIL_PASSWORD:
                    case API_ERRORS.USER_NOT_FOUND:
                        return res.badRequest(Utils.jsonErr('INVALID_EMAIL_OR_PASSWORD'));
                    case API_ERRORS.USER_LOCKED:
                        return res.forbidden(Utils.jsonErr('ACCOUNT_LOCKED'));
                    case API_ERRORS.INACTIVE_TOKEN:
                        return res.badRequest(Utils.jsonErr("INACTIVE_TOKEN"));
                    case API_ERRORS.EXCEPTION:
                        return res.serverError(Utils.jsonErr("EXCEPTION"));
                    default:
                        /* istanbul ignore next */
                        return res.serverError(Utils.jsonErr(err));
                }
            });
    },

    /**
     * Action for /user/forgot
     * @param req
     * @param res
     * @returns {*}
     */

    forgotPassword: function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        const email = req.body.email;

        if (!email || !validator.isEmail(email)) {
            return res.badRequest(Utils.jsonErr('INVALID_EMAIL'));
        }

        UserManager
            .generateResetToken(email)
            .then(function () {
                res.ok('CHECK_YOUR_MAIL');
            })
            .catch(err => {
                if (err === API_ERRORS.USER_NOT_FOUND) {
                    return res.notFound(Utils.jsonErr('USER_NOT_FOUND'));
                }
                /* istanbul ignore next */
                return res.serverError(Utils.jsonErr(err));
            });
    },

    /**
     * Action for /user/change_password
     * @param req
     * @param res
     * @returns {*}
     */
    changePassword: function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        const username = req.body.username;
        const currentPassword = req.body.password;
        const newPassword = req.body.new_password;
        const newPasswordConfirm = req.body.new_password_confirm;
        let isEmail = false;

        if (validator.isEmail(username))
            isEmail = true;

        if (!username)
            return res.badRequest(Utils.jsonErr('USERNAME_OR_EMAIL_IS_REQUIRED'));

        if (!currentPassword)
            return res.badRequest(Utils.jsonErr('CURRENT_PASSWORD_IS_REQUIRED'));

        if (!newPassword || newPassword !== newPasswordConfirm)
            return res.badRequest(Utils.jsonErr('PASSWORD_DOES_NOT_MATCH'));

        if (!passSchema.validate(newPassword))
            return res.badRequest(Utils.jsonErr('PASSWORD_MUST_BE_6-24_CHARACTERS_INCLUDING_LETTERS_AND_DIGITS'));


        UserManager
            .changePassword(username, currentPassword, newPassword, isEmail)
            .then(function (data) {
                res.ok('PASSWORD_UPDATED_SUCCESSFULLY');
            })
            .catch(err => {
                switch (err) {
                    case API_ERRORS.USER_NOT_FOUND:
                        return res.badRequest(Utils.jsonErr('EMAIL_NOT_FOUND'));

                    case API_ERRORS.INVALID_PASSWORD:
                        return res.badRequest(Utils.jsonErr('INVALID_USERNAME/EMAIL_OR_PASSWORD'));

                    case API_ERRORS.EXCEPTION:
                        return res.serverError(Utils.jsonErr("EXCEPTION"));

                    default:
                        return res.serverError(Utils.jsonErr(err));
                }
            });
    },

    /**
     * Action for /user/reset_password
     * @param req
     * @param res
     * @returns {*}
     */

    resetPasswordByResetToken: function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        const email = req.body.email;
        const resetToken = req.body.reset_token;
        const newPassword = req.body.new_password;
        const newPasswordConfirm = req.body.new_password_confirm;

        if (!email || !validator.isEmail(email)) {
            return res.badRequest(Utils.jsonErr('INVALID_EMAIL'));
        }

        if (!resetToken) {
            return res.badRequest(Utils.jsonErr('RESET_TOKEN_IS_REQUIRED'));
        }

        if (!newPassword || newPassword !== newPasswordConfirm) {
            return res.badRequest(Utils.jsonErr('PASSWORD_DOES_NOT_MATCH'));
        }

        if (!passSchema.validate(newPassword)) {
            return res.badRequest(Utils.jsonErr('PASSWORD_MUST_BE_6-24_CHARACTERS_INCLUDING_LETTERS_AND_DIGITS'));
        }

        UserManager
            .resetPasswordByResetToken(email, resetToken, newPassword)
            .then(() => {
                res.ok('DONE');
            })
            .catch(err => {
                if (err === API_ERRORS.USER_NOT_FOUND) {
                    // We show invalid email instead of User Not Found
                    return res.badRequest(Utils.jsonErr('INVALID_EMAIL'));
                }
                /* istanbul ignore next */
                return res.serverError(Utils.jsonErr(err));
            });
    },
};