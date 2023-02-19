/**
 * Nodemailer.js
 * @type {object}
*/
const nodemailer = require("nodemailer");

// attributes set for sending email
const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "dragonsarvesh15@gmail.com", // replace this email before showing my friend
        pass: "yqtgzqofhkvthbhc", // app password generated through google
    }
});

module.exports = {
    /**
     * Returns an object with error field for response
     * @param otp {string}
     * @returns {{err_msg: {string}}}
     */
    sendOtp(otp, email) {
        return new Promise(async (resolve, reject) => {

            var mailOptions = {
                from: 'dragonsarvesh15@gmail.com',
                to: email,
                subject: "OTP",
                text: "Hello user, Your one time password (otp) is " + otp + ". This OTP is confidential. For security reasons, DO NOT share the OTP with anyone.",
                // html: "<b>you can send plain text or html body</b>",

                // attachments: [ // add attachments in future use
                //     {
                //         // filename: 'mailtrap.png',
                //         // path: __dirname + '/mailtrap.png',
                //         // cid: 'uniq-mailtrap.png'
                //     }
                // ]
            };

            await transporter.sendMail(mailOptions, (error, info) => {
                if (error)
                    reject(error);
                else
                    resolve(info.response);
            })
        })
    },

    contactUs(newForm) {
        return new Promise(async (resolve, reject) => {
            var mailOptions = {
                from: 'dragonsarvesh15@gmail.com',
                to: "sarveshpadwalkar19@gmail.com",
                subject: newForm.subject,
                text: "From: " + newForm.name + "\nEmail: " + newForm.email + "\nMessage: " + newForm.message,
            };

            await transporter.sendMail(mailOptions, (error, info) => {
                if (error)
                    reject(error);
                else
                    resolve(info.response);
            })
        })
    }
};