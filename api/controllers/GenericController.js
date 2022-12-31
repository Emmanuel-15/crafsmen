/**
 * GenericController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const md5 = require('md5');

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
                return res.serverError(err);

            // If no files were uploaded, respond with an error.
            if (uploadedFiles.length === 0)
                return res.badRequest('NO_FILE_WAS_UPLOADED');

            return res.ok("IMAGE_UPLOADED", uploadedFiles[0].fd);
        });
    }
};