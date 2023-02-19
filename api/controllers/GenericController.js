/**
 * GenericController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const md5 = require('md5');
const Utils = require('../services/Utils');
const validator = require('validator');
const Nodemailer = require('../services/Nodemailer');

module.exports = {
    upload: function (req, res) {
        // setting allowed file types
        var allowedTypes = ['image/jpeg', 'image/png'];

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        let year = new Date().getFullYear();
        let month = new Date().getMonth();
        let date = new Date().getDate();

        req.file('image').upload({
            // don't allow the total upload size to exceed ~10MB
            maxBytes: 10000000,

            // skipper default upload directory .tmp/uploads/
            dirname: '../../public/uploads/' + year + '/' + monthNames[month] + '/' + date,

            saveAs: function (file, cb) {
                if (file.byteCount > 10000000)
                    return res.badRequest(Utils.jsonErr("MAX_FILE_SIZE_10MB!"));

                var d = new Date();
                var extension = file.filename.split('.').pop();

                // generating unique filename with extension
                var uuid = md5(d.getMilliseconds()) + "." + extension;

                // seperate allowed and disallowed file types
                if (allowedTypes.indexOf(file.headers['content-type']) === -1) {
                    // save as disallowed files default upload path
                    // cb(null, uuid);
                    return res.badRequest(Utils.jsonErr("ONLY_JPEG_&_PNG_FILES_ALLOWED"));

                } else {
                    // save as allowed files
                    cb(null, uuid);

                    // cb(null, allowedDir + "/" + uuid);
                }
            }
        }, function whenDone(err, uploadedFiles) {
            if (err)
                return res.serverError(Utils.jsonErr("ERROR_WHILE_UPLOADING_IMAGE"));

            // If no files were uploaded, respond with an error.
            if (uploadedFiles.length === 0)
                return res.badRequest(Utils.jsonErr("NO_FILE_WAS_UPLOADED"));

            return res.ok("IMAGE_UPLOADED", uploadedFiles[0].fd);
        });
    },

    contactUs: async function (req, res) {

        const newForm = {
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message
        }

        const schema = {
            type: 'object',
            required: ['name', 'email', 'subject', 'message'],
            properties: {
                name: {
                    type: 'string',
                    maxLength: 30,
                    errorMessage: {
                        type: 'INVALID_NAME',
                        maxLength: 'NAME_SHOULD_NOT_EXCEED_30_CHARACTERS'
                    }
                },
                email: {
                    type: 'string',
                    format: 'email',
                    errorMessage: {
                        type: 'EMAIL_SHOUL_BE_STRING',
                        format: 'INVALID_EMAIL'
                    }
                },
                subject: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_SUBJECT',
                    }
                },
                message: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_MESSAGE',
                    }
                }

            }, errorMessage: {
                required: {
                    name: 'NAME_IS_REQUIRED',
                    email: 'EMAIL_IS_REQUIRED',
                    subject: 'SUBJECT_IS_REQUIRED',
                    message: 'MESSAGE_IS_REQUIRED'
                }
            }
        }

        const validations = Utils.validate(schema, newForm);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        const mail = await Nodemailer.contactUs(newForm);

        if (!mail)
            return res.badRequest(Utils.jsonErr("ERROR_SENDING_MAIL"));
        else
            return res.ok("MAIL_SENT");

    }
};