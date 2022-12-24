const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const moment = require('moment');
const farmhash = require('farmhash');

const API_ERRORS = require('../constants/APIErrors');
// const { exits, login } = require('../controllers/UserController');
const { hash } = require('bcrypt');
const { find } = require('sails-postgresql');

const LOCK_INTERVAL_SEC = 120;
const LOCK_TRY_COUNT = 5;

function doesEmailExists(email) {
    return new Promise((resolve, reject) => {
        UserLogin
            .findOne({ userEmail: email })
            .exec((err, user) => {
                if (err) return reject(err);
                return resolve(!!user);
            });
    });
}

function doesUsernameExist(username) {
    return new Promise((resolve, reject) => {
        UserLogin
            .findOne({ loginUsername: username })
            .exec((err, user) => {
                if (err) return reject(err);
                return resolve(!!user);
            });
    });
}

function updateUserLockState(user, done) {
    const now = moment().utc();

    let prevFailure = null;
    if (user.lastPasswordFailure) {
        prevFailure = moment(user.lastPasswordFailure);
    }

    if (prevFailure !== null && now.diff(prevFailure, 'seconds') < LOCK_INTERVAL_SEC) {
        user.passwordFailures += 1;

        // lock if this is the 4th incorrect attempt
        if (user.passwordFailures >= LOCK_TRY_COUNT) {
            user.locked = true;
        }
    } else {
        // reset the failed attempts
        user.passwordFailures = 1;
    }

    user.lastPasswordFailure = now.toDate();
    user.save(done);
}

module.exports = {

    /**
     * Creates a new user
     * @param values
     * @returns {Promise}
     */
    createUser: (values) => {
        const email = values.email;
        const username = values.username;
        const password = values.password;

        return new Promise((resolve, reject) => {

            doesUsernameExist(username)
                .then(exits => {

                    if (exits)
                        return reject(API_ERRORS.USERNAME_IN_USE);

                    doesEmailExists(email)
                        .then(exists => {

                            if (exists)
                                return reject(API_ERRORS.EMAIL_IN_USE);

                            try {
                                UserLogin.create({ userEmail: email, loginUsername: username, loginPassword: password, isActive: true }).exec((createErr, usr) => {

                                    if (createErr)
                                        return reject(createErr);

                                    UserLogin
                                        .findOne({ userEmail: email })
                                        .exec((err, user) => {
                                            if (err) return reject(err);

                                            UserManager._generateToken(user, (token, refresh_token) => {
                                                resolve({ token, refresh_token });
                                                // EmailService.sendWelcome(email);
                                            });
                                        });
                                });
                            } catch (e) {
                                return reject(API_ERRORS.EXCEPTION);
                            }
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    },

    /**
     * Generates JWT token
     * TODO Promisify
     * @param user
     * @param done
     * @returns {*}
     * @private
     */
    _generateToken: async function (user, done) {

        let payload;
        let isEmail;

        if (user.emailOrPhone) {
            isEmail = await Temp.check(user.emailOrPhone);

            if (isEmail)
                payload = { email: user.emailOrPhone }
            else
                payload = { phone: user.emailOrPhone }
        } else {
            payload = (user.userEmail) ? { email: user.userEmail } : { phone: user.userContactNumber }
        }

        const token = jwt.sign(payload,
            sails.config.jwt_secret,
            { expiresIn: '24h' },
            { header: { "id": user.userId } })

        return done(token);
    },


    /**
     * Authenticates user by a JWT token.
     *
     * Uses in JWT Policy
     * @see api/policies/jwtAuth.js
     *
     * @param token
     * @returns {Promise}
     */
    authenticateUserByToken: function (token) {

        return new Promise((resolve, reject) => {
            jwt.verify(token, sails.config.jwt_secret, (err, tokenData) => {
                if (err) return reject(err); // JWT parse error

                let obj = (tokenData.email) ? { userEmail: tokenData.email } : { userContactNumber: tokenData.phone }

                try {
                    UserLogin
                        .findOne(obj)
                        .exec((err, user) => {
                            if (err) return reject(err); // Query error
                            if (!user) return reject(API_ERRORS.USER_NOT_FOUND);
                            if (user.locked) return reject(API_ERRORS.USER_LOCKED);

                            if (tokenData.email && tokenData.email !== user.userEmail)
                                return reject(API_ERRORS.INACTIVE_TOKEN)

                            if (tokenData.phone && tokenData.phone !== user.userContactNumber)
                                return reject(API_ERRORS.INACTIVE_TOKEN);

                            return resolve(user);
                        });

                } catch (err) {
                    return reject(API_ERRORS.EXCEPTION);
                }
            });
        });
    },


    authenticateUserByRefreshToken: function (token) {
        return new Promise((resolve, reject) => {

            jwt.verify(token, sails.config.jwt_secret, { ignoreExpiration: true }, (err, tokenData) => {
                if (err) return reject(err); // JWT parse error

                try {
                    let obj = (tokenData.email) ? { userEmail: tokenData.email } : { userContactNumber: tokenData.phone }

                    UserLogin
                        .findOne(obj)
                        .exec((err, user) => {
                            if (err) return reject(err); // Query error
                            if (!user) return reject(API_ERRORS.USER_NOT_FOUND);
                            if (user.locked) return reject(API_ERRORS.USER_LOCKED);

                            return resolve(user);
                        });

                } catch (err) {
                    return reject(API_ERRORS.EXCEPTION);
                }
            });
        });
    },

    /**
     * Validates user password
     * @param email
     * @param password
     * @param isEmail
     * @returns {Promise}
     */
    validatePassword(username, password, isEmail) {
        return new Promise((resolve, reject) => {
            let findObj = (isEmail) ? { userEmail: username } : { loginUsername: username }

            try {
                UserLogin.findOne(findObj)
                    .exec((err, user) => {
                        if (err) return reject(err);
                        if (!user) return reject(API_ERRORS.USER_NOT_FOUND);
                        if (user.locked) return reject(API_ERRORS.USER_LOCKED);

                        UserLogin
                            .validatePassword(password, user.loginPassword)
                            .then(isValid => {
                                resolve({ isValid, user });
                            })
                            .catch(reject);
                    });
            }
            catch (e) {
                return reject(API_ERRORS.EXCEPTION);
            }
        });
    },

    /**
     * Authenticates user by email and password.
     * @param username
     * @param password
     * @param isEmail
     * @returns {Promise}
     */
    authenticateUserByPassword: function (username, password, isEmail) {

        return new Promise((resolve, reject) => {
            UserManager
                .validatePassword(username, password, isEmail)
                .then(({ isValid, user }) => {
                    if (!isValid) {
                        // updateUserLockState(user, saveErr => {
                        //     if (saveErr) return reject(saveErr);
                        // });
                        return reject(API_ERRORS.INVALID_EMAIL_PASSWORD);
                    } else {
                        UserManager._generateToken(user, (token) => {
                            resolve({ token });
                        });
                    }
                })
                .catch(reject);
        });
    },


    /**
     * Generates password reset token
     * @param email
     * @returns {Promise}
     */
    generateResetToken: function (email) {
        return new Promise((resolve, reject) => {
            try {
                UserLogin
                    .findOne({ email })
                    .exec((err, user) => {
                        if (err) return reject(err); // Query error
                        if (!user) return reject(API_ERRORS.USER_NOT_FOUND);

                        const resetToken = shortid.generate();
                        user.resetToken = resetToken;
                        user.save(saveErr => {
                            if (saveErr) return reject(saveErr);

                            EmailService.sendResetToken(email, resetToken);
                            resolve();
                        });
                    });

            } catch (err) {
                return reject(API_ERRORS.EXCEPTION);
            }
        });
    },


    /**
     * Changes password
     * @param email
     * @param currentPassword
     * @param newPassword
     * @returns {Promise}
     */
    changePassword: function (username, currentPassword, newPassword, isEmail) {
        return new Promise((resolve, reject) => {
            UserManager
                .validatePassword(username, currentPassword, isEmail)
                .then(({ isValid, user }) => {
                    if (!isValid) {
                        return reject(API_ERRORS.INVALID_PASSWORD);
                    } else {
                        UserLogin
                            .setPassword(newPassword)
                            .then((hash) => {
                                try {
                                    UserLogin
                                        .updateOne({ userId: user.userId })
                                        .set({ loginPassword: hash })
                                        .exec((err, data) => {
                                            if (err) reject(err);
                                            resolve(data)
                                        })

                                } catch (err) {
                                    return reject(API_ERRORS.EXCEPTION);
                                }
                            })
                    }
                })
                .catch(reject);
        });
    },


    /**
     * Resets password to a new one by reset token.
     * @param email
     * @param resetToken
     * @param newPassword
     * @returns {Promise}
     */
    resetPasswordByResetToken: function (email, resetToken, newPassword) {
        return new Promise((resolve, reject) => {
            UserLogin
                .findOne({ email, resetToken })
                .exec((err, user) => {
                    if (err) return reject(err); // Query error
                    if (!user) return reject(API_ERRORS.USER_NOT_FOUND);

                    // TODO Check reset token validity

                    UserLogin
                        .setPassword(newPassword, user)
                        .then(() => {
                            user.resetToken = null;
                            user.passwordFailures = 0;
                            user.lastPasswordFailure = null;
                            user.save();

                            resolve();
                        })
                        .catch(reject);
                });
        });
    },


    otpViaEmail: function (findObj, emailOrPhone) {
        return new Promise(async (resolve) => {
            const user = await UserLogin.findOne(findObj);

            if (user) {
                // email service...

                const otp = 1234;

                await UserLogin.updateOne(findObj).set({ hashCode: otp });

                resolve();

            } else {
                // email service...

                const userInput = emailOrPhone;
                const otp = 1234;

                await Temp.create({ emailOrPhone: userInput, otp: otp });

                resolve();

            }
        })
    },

    otpViaPhone: function (findObj, emailOrPhone) {
        return new Promise(async (resolve) => {
            const user = await UserLogin.findOne(findObj);

            if (user) {
                // SMS service...

                const otp = 1234;

                await UserLogin.updateOne(findObj).set({ hashCode: otp });

                resolve();

            } else {
                // SMS service...

                const userInput = emailOrPhone;
                const otp = 1234;

                await Temp.create({ emailOrPhone: userInput, otp: otp });

                resolve();

            }
        })
    }
};