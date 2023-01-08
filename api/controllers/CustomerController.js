/**
 * CustomerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const UserManager = require('../services/UserManager');
const Utils = require('../services/Utils');

const validator = require('validator');

// See ref https://www.npmjs.com/package/validation-master
const validation_master = require('validation-master');

module.exports = {

    /**
     * Action for /customer
     * @param req
     * @param res
     * @returns {*}
     */
    create: async function (req, res) {
        const validReq = await Utils.isValidRequest(req, false, true);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        const emailOrPhone = req.body.emailOrPhone;
        let isEmail = false;
        let isNumber = false;

        if (validator.isEmail(emailOrPhone.toString()))
            isEmail = true;

        else if (validation_master.phoneNumberValidator(emailOrPhone))
            isNumber = true;

        if (isEmail == false && isNumber == false)
            return res.badRequest(Utils.jsonErr("INVALID_EMAIL_PHONE"));

        let findObj = (isEmail) ? { userEmail: emailOrPhone } : { userContactNumber: emailOrPhone };

        if (isEmail) {
            await UserManager
                .otpViaEmail(findObj, emailOrPhone)
                .then(() => {
                    return res.ok("OTP_SENT_SUCCESSFULLY");
                })
                .catch(err => {
                    if (err == API_ERRORS.ERROR_SENDING_OTP)
                        return res.badRequest(Utils.jsonErr(API_ERRORS.ERROR_SENDING_OTP));
                    else
                        return res.serverError(Utils.jsonErr(err));

                });;

        } else {
            await UserManager
                .otpViaSms(findObj, emailOrPhone)
                .then(() => {
                    return res.ok("OTP_SENT_SUCCESSFULLY");
                });
        }
    },

    /**
     * Action for /validate-customer
     * @param req
     * @param res
     * @returns {*}
     */
    validate: async function (req, res) {
        const validReq = await Utils.isValidRequest(req, false, true);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        const emailOrPhone = req.body.emailOrPhone;
        const otp = req.body.otp;
        let isEmail = false;
        let isNumber = false;
        let temp_table = null;

        if (isNaN(otp))
            return res.badRequest(Utils.jsonErr("INVALID_OTP"));

        if (validator.isEmail(emailOrPhone.toString()))
            isEmail = true;

        else if (validation_master.phoneNumberValidator(emailOrPhone))
            isNumber = true;

        if (isEmail == false && isNumber == false)
            return res.badRequest(Utils.jsonErr("INVALID_EMAIL_PHONE"));

        let obj = (isEmail) ? { userEmail: emailOrPhone } : { userContactNumber: emailOrPhone };

        const user_table = await UserLogin.findOne(obj);

        if (!user_table) {
            temp_table = await Temp.findOne({ emailOrPhone: emailOrPhone });

            if (!temp_table)
                return res.badRequest(Utils.jsonErr("EMAIL_OR_PHONE_NUMBER_NOT_FOUND"))
        }

        if (user_table) {
            if (user_table.hashCode != otp)
                return res.unauthorized("INVALID_OTP");
            else {
                UserManager._generateToken(user_table, (token) => {
                    return res.ok("VERIFIED", { token });
                });
            }

        } else {
            if (temp_table.otp != otp)
                return res.unauthorized("INVALID_OTP");
            else {
                obj.isActive = true;
                await UserLogin.create(obj);

                UserManager._generateToken(temp_table, (token) => {
                    return res.ok("VERIFIED", { token });
                });
            }
        }
    },

    /**
     * Action for /customer-details
     * @param req
     * @param res
     * @returns {*}
     */
    getDetails: async function (req, res) {
        try {
            await UserLogin.findOne({ userId: req.user.userId })
                .exec((err, data) => {
                    if (err)
                        return res.ok("ERROR_WHILE_FETCHING_USER_DETAILS");
                    else
                        return res.ok("USER_DETAILS", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for /customer-details
     * @param req
     * @param res
     * @returns {*}
     */
    enterDetails: async function (req, res) {
        const validReq = await Utils.isValidRequest(req, false, true);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        const updateCustomerDetails = {
            userName: req.body.userName,
            userAddress: req.body.userAddress,
            userEmail: req.body.userEmail,
            userContactNumber: req.body.userContactNumber,
            userGender: req.body.userGender,
            userImage: req.body.userImage
        }

        const schema = {
            type: 'object',
            // required: ['userName', 'userAddress', 'userGender'],
            properties: {
                userName: {
                    type: 'string',
                    maxLength: 20,
                    errorMessage: {
                        type: 'INVALID_NAME',
                        maxLength: 'NAME_SHOULD_NOT_EXCEED_20_CHARACTERS'
                    }
                },
                userAddress: {
                    type: 'string',
                    maxLength: 40,
                    errorMessage: {
                        type: 'INVALID_ADDRESS',
                        maxLength: 'ADDRESS_SHOULD_NOT_EXCEED_40_CHARACTERS'
                    }
                },
                userEmail: {
                    type: 'string',
                    format: 'email',
                    errorMessage: {
                        type: 'INVALID_EMAIL',
                        format: 'INVALID_EMAIL'
                    }
                },
                userContactNumber: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_NUMBER',
                    }
                },
                userGender: {
                    type: 'boolean',
                    errorMessage: {
                        type: 'INVALID_AGE',
                    }
                },
                userImage: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_IMG_PATH',
                    }
                }

            }, errorMessage: {
                // required: {
                //     userName: 'NAME_IS_REQUIRED',
                //     userAddress: 'ADDRESS_IS_REQUIRED',
                //     userGender: 'GENDER_IS_REQUIRED'
                // }
            }
        }

        const validations = Utils.validate(schema, updateCustomerDetails);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        if (updateCustomerDetails.userContactNumber && !validation_master.phoneNumberValidator(updateCustomerDetails.userContactNumber))
            return res.badRequest(Utils.jsonErr("INVALID_PHONE_NUMBER"));

        if (updateCustomerDetails.userEmail) {
            const checkEmail = await UserLogin.findOne({ userEmail: updateCustomerDetails.userEmail });

            if (checkEmail.userId != req.user.userId)
                return res.badRequest(Utils.jsonErr("EMAIL_ALREADY_IN_USE"));
        }

        if (updateCustomerDetails.userContactNumber) {
            const checkPhone = await UserLogin.findOne({ userContactNumber: updateCustomerDetails.userContactNumber });

            if (checkPhone.userId != req.user.userId)
                return res.badRequest(Utils.jsonErr("PHONE_NUMBER_ALREADY_IN_USE"));
        }

        try {
            await UserLogin.updateOne({ userId: req.user.userId })
                .set(updateCustomerDetails)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_UPDATING_USER_DETAILS"));
                    else
                        return res.ok("UPDATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};