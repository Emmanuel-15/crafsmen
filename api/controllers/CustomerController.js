/**
 * CustomerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const validator = require('validator');
const validation_master = require('validation-master');

module.exports = {
    /**
      * Action for /customer
      * @param req
      * @param res
      * @returns {*}
      */
    createCustomer: async function (req, res) {
        if (req.method !== 'POST')
            return res.notFound();


        if (!req.body || _.keys(req.body).length <= 0)
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));


        const emailOrPhone = req.body.emailOrPhone;
        let isEmail = false;
        let isNumber = false;

        if (validator.isEmail(emailOrPhone.toString()))
            isEmail = true;

        else if (validation_master.phoneNumberValidator(emailOrPhone))
            isNumber = true;


        if (isEmail == false && isNumber == false)
            return res.badRequest(Utils.jsonErr("INVALID_EMAIL_PHONE"));

        let findObj = (isEmail) ? { userEmail: emailOrPhone } : { userContactNumber: emailOrPhone }


        if (isEmail) {
            await UserManager
                .otpViaEmail(findObj, emailOrPhone)
                .then(() => {
                    return res.ok("OTP_SENT_SUCCESS");
                })

        } else {
            await UserManager
                .otpViaPhone(findObj, emailOrPhone)
                .then(() => {
                    return res.ok("OTP_SENT_SUCCESS");
                })
        }
    },
    /**
         * Action for /customer-validate
         * @param req
         * @param res
         * @returns {*}
         */
    validate: async function (req, res) {
        if (req.method !== 'POST')
            return res.notFound();


        if (!req.body || _.keys(req.body).length <= 0)
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));


        const emailOrPhone = req.body.emailOrPhone;
        const otp = req.body.otp;
        let isEmail = false;
        let isNumber = false;

        if (isNaN(otp))
            return res.badRequest(Utils.jsonErr("INVALID_OTP"));

        if (validator.isEmail(emailOrPhone.toString()))
            isEmail = true;

        else if (validation_master.phoneNumberValidator(emailOrPhone))
            isNumber = true;


        if (isEmail == false && isNumber == false)
            return res.badRequest(Utils.jsonErr("INVALID_EMAIL_PHONE"));


        let obj = (isEmail) ? { userEmail: emailOrPhone } : { userContactNumber: emailOrPhone }

        const user_table = await UserLogin.findOne(obj);
        let temp_table;

        if (!user_table) {
            temp_table = await Temp.findOne({ emailOrPhone: emailOrPhone });

            if (!temp_table)
                return res.badRequest(Utils.jsonErr("EMAIL_OR_PHONE_NUMBER_NOT_FOUND"))
        }


        if (user_table) {
            if (user_table.hashCode != otp)
                return res.unauthorized("INVALID_OTP");
            else {

                console.log("I am user_table: ", user_table)
                UserManager._generateToken(user_table, (token) => {
                    return res.ok("VERIFIED", { token });
                });
            }

        } else {
            if (temp_table.otp != otp)
                return res.unauthorized("INVALID_OTP");
            else {
                await UserLogin.create(obj);

                console.log("I am temp_table", temp_table)

                UserManager._generateToken(temp_table, (token) => {
                    return res.ok("VERIFIED", { token });
                });
            }
        }
    },
    getDetails: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();

        try {
            const user = await UserLogin.findOne({ userId: req.user.userId });

            return res.ok("CUSTOMER", user);

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    },

    enterDetails: async function (req, res) {
        if (req.method !== 'POST')
            return res.notFound();

        if (!req.body || _.keys(req.body).length <= 0)
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));

        const updateCustomerDetails = {
            userName: req.body.userName,
            userAddress: req.body.userAddress,
            userEmail: req.body.userEmail,
            userContactNumber: req.body.userContactNumber,
            userGender: req.body.userGender
        }

        if (updateCustomerDetails.userEmail && !validator.isEmail(updateCustomerDetails.userEmail))
            return res.badRequest(Utils.jsonErr("INVALID_EMAIL"));

        if (updateCustomerDetails.userContactNumber && !validation_master.phoneNumberValidator(updateCustomerDetails.userContactNumber))
            return res.badRequest(Utils.jsonErr("INVALID_PHONE_NUMBER"));

        console.log("check: ", updateCustomerDetails.userAddress.length)

        console.log("I am obj: ", updateCustomerDetails)

        try {
            await UserLogin.updateOne({ userId: req.user.userId }).set(updateCustomerDetails)

            return res.ok("UPDATED");
        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }

};

