const APIErrors = require("../constants/APIErrors");
const md5 = require('md5');
const UserManager = require("./UserManager");

/**
 * Utils
 * @type {object}
 */
module.exports = {

    /**
     * Uploads a file by the user after checking it's extension.
     * @param errorMessage {string}
     * @returns {{err_msg: {string}}}
     */
    uploadFile: function (req, newComment) {
        return new Promise((resolve, reject) => {
            // setting allowed file types
            var allowedTypes = ['image/jpeg', 'image/png'];

            // skipper default upload directory .tmp/uploads/
            // var allowedDir = "../../uploads";

            // do not define dirname, use default path
            req.file("file").upload({
                maxBytes: 10000000,
                dirname: '../../uploads',

                saveAs: function (file, cb) {
                    if (file.byteCount > 10000000)
                        return reject("FILE_SIZE_LIMIT_EXCEEDED.")

                    var d = new Date();
                    var extension = file.filename.split('.').pop();

                    // generating unique filename with extension
                    var uuid = md5(d.getMilliseconds()) + "." + extension;

                    // seperate allowed and disallowed file types
                    if (allowedTypes.indexOf(file.headers['content-type']) === -1) {
                        // save as disallowed files default upload path
                        // cb(null, uuid);
                        return reject(APIErrors.NOT_ALLOWED);
                    } else {
                        // save as allowed files
                        cb(null, uuid);

                        // cb(null, allowedDir + "/" + uuid);
                    }
                }
            }, function whenDone(err, files) {
                if (err)
                    return reject(err);

                if (Object.keys(files).length > 0) {
                    newComment.is_attachment = true;
                    newComment.file_path = files[0].fd;
                }

                resolve(newComment);
            });
        })
    },

    createComment: function (req, newComment) {
        return new Promise(async (resolve, reject) => {
            if (req._fileparser.upstreams.length >= 1) {
                await CommentsManager
                    .uploadFile(req, newComment)
                    .then((data) => {
                        console.log("Done");
                        newComment = data;
                    })
                    .catch(err => {
                        return res.badRequest(Utils.jsonErr(err));
                    })
            }
            CommentsManager
                .create(newComment)
                .then((err, data) => {
                    if (err) reject(err)

                    resolve(data)
                })
        })
    },

    create: function (newComment) {
        return new Promise((resolve, reject) => {
            try {
                Comments
                    .create(newComment)
                    .exec((err, data) => {
                        if (err) reject(err)

                        resolve(data);
                    })

            } catch (err) {
                console.log("Exception: ", err);
            }
        })
    }
};
