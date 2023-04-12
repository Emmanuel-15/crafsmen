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
        user: "craftsmen167@gmail.com", // replace this email before showing my friend
        pass: "ffyqklrmupwjrmnu", // app password generated through google
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
                from: 'craftsmen167@gmail.com',
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
                console.log("err, info: ", error, info);
                if (error)
                    reject(error);
                else
                    resolve(info.response);
            });
        })
    },

    contactUs(newForm) {
        return new Promise(async (resolve, reject) => {
            var mailOptions = {
                from: 'craftsmen167@gmail.com',
                to: "saibandekar10@gmail.com",
                subject: newForm.subject,
                text: "From: " + newForm.name + "\nEmail: " + newForm.email + "\nMessage: " + newForm.message,
            };

            await transporter.sendMail(mailOptions, (error, info) => {
                if (error)
                    reject(error);
                else
                    resolve(info.response);
            });
        })
    },

    bookingCreated(data) {
        return new Promise(async (resolve, reject) => {

            let userData = await UserLogin.findOne({ select: ['userEmail', 'userName'], where: { userId: data.user_id } });
            let serviceData = await Services.findOne({ serviceId: data.service_id })
            let contractorData = await Contractors.findOne({ contractorId: data.contractor_id });

            var mailOptions = {
                from: 'craftsmen167@gmail.com',
                to: userData.userEmail,
                subject: "Booking created",
                text: "Hello " + userData.userName + ",\nYour booking for " + serviceData.serviceTitle + " service from " + data.booking_date_time_from +
                    " to " + data.booking_date_time_to + " with " + contractorData.contractorName + " has been created successfully." +
                    " We are looking forward to serve you soon.\nThank you for choosing Craftsmen." + "\nPlease check your email for further notifications."
            };

            await transporter.sendMail(mailOptions, (error, info) => {
                if (error)
                    reject(error);
                else
                    resolve(info.response);

            });
        })
    },

    bookingStatus(id, status) {
        return new Promise(async (resolve, reject) => {

            let message, subject;
            let bookingData = await Bookings.findOne({ bookingId: id });
            let serviceData = await Services.findOne({ serviceId: bookingData.serviceId });
            let userData = await UserLogin.findOne({ select: ['userEmail', 'userName'], where: { userId: bookingData.userId } });

            switch (status) {
                case 'CONFIRM':
                    subject = "Booking confirmed";
                    message = "Hello " + userData.userName + ", \nYour booking for '" + serviceData.serviceTitle + "' Service with Booking ID '" + bookingData.bookingId +
                        "' Has been confirmed. \nWe are looking forward to serve you soon. \nThank you for choosing Craftsmen.";
                    break;

                case 'IN-PROGRESS':
                    subject = "Booking In-progress";
                    message = "Hello " + userData.userName + ", \nYour booking for '" + serviceData.serviceTitle + "' Service with Booking ID '" + bookingData.bookingId +
                        "' is in progress. And will be completed soon. \nThank you for choosing Craftsmen.";
                    break;

                case 'PENDING':
                    subject = "Booking pending";
                    message = "Hello " + userData.userName + ", \nYour booking for '" + serviceData.serviceTitle + "' Service with Booking ID '" + bookingData.bookingId +
                        "' is still pending and will be approved soon. \nWe are looking forward to serve you soon. \nThank you for choosing Craftsmen.";
                    break;

                case 'COMPLETE':
                    subject = "Booking completed";
                    message = "Hello " + userData.userName + ", \nYour booking for '" + serviceData.serviceTitle + "' Service with Booking ID '" + bookingData.bookingId +
                        "' has been completed. \nWe hope you liked our service. Please do rate our work by clicking on the link provided below." +
                        "\n http://localhost:3000/contact-us \nThank you for choosing Craftsmen.";
                    break;

                case 'CANCEL':
                    subject = "Booking cancelled";
                    message = "Hello " + userData.userName + ", \nYour booking for '" + serviceData.serviceTitle + "' Service with Booking ID '" + bookingData.bookingId +
                        "' has been cancelled. Please contact Craftsmen for more details about the cancelled booking. \nThank you for choosing Craftsmen.";
                    break;

                default:
                    break;
            }

            var mailOptions = {
                from: 'craftsmen167@gmail.com',
                to: userData.userEmail,
                subject: subject,
                text: message
            };

            await transporter.sendMail(mailOptions, (error, info) => {
                if (error)
                    reject(error);
                else
                    resolve(info.response);

            });
        })
    },

    bookingCancelled(id) {
        return new Promise(async (resolve, reject) => {

            let bookingData = await Bookings.findOne({ bookingId: id });
            let serviceData = await Services.findOne({ serviceId: bookingData.serviceId });
            let userData = await UserLogin.findOne({ select: ['userEmail', 'userName'], where: { userId: bookingData.userId } });

            var mailOptions = {
                from: 'craftsmen167@gmail.com',
                to: userData.userEmail,
                subject: "Booking Deleted",
                text: "Hello " + userData.userName + ",\nYour booking for " + serviceData.serviceTitle + " service from " + bookingData.bookingDateTimeFrom +
                    " to " + bookingData.bookingDateTimeTo + " has been cancelled successfully."
            };

            await transporter.sendMail(mailOptions, (error, info) => {
                if (error)
                    reject(error);
                else
                    resolve(info.response);

            });
        })
    }
};