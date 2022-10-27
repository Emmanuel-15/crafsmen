const APIErrors = require("../constants/APIErrors");
const CarModelManager = require("./CarModelManager");
const md5 = require('md5');

module.exports = {

    /**
     * Returns an object with error field for response
     * @param errorMessage {string}
     * @returns {{err_msg: {string}}}
     */

    uploadFile: function (req, newCar) {
        return new Promise((resolve, reject) => {
            // setting allowed file types
            let allowedTypes = ['image/jpeg', 'image/png'];

            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            let year = new Date().getFullYear();
            let month = new Date().getMonth();
            let date = new Date().getDate();


            req.file("carImage").upload({
                maxBytes: 10000000,
                dirname: '../../uploads/cars' + '/' + year + '/' + monthNames[month] + '/' + date,

                saveAs: function (file, cb) {
                    if (file.byteCount > 10000000)
                        return reject(APIErrors.LARGE_FILE);

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

                newCar.carImage = files[0].fd;

                resolve(newCar);
            });
        })

    },

    createCar: function (req, newCar) {
        return new Promise((resolve, reject) => {
            if (req && req._fileparser && req._fileparser.upstreams.length >= 1) {
                CarManager
                    .uploadFile(req, newCar)
                    .then((newCar) => {
                        try {
                            Car.create(newCar)
                                .exec((err, data) => {
                                    if (err) return reject(err)

                                    resolve(data);
                                })

                        } catch (err) {
                            return reject(APIErrors.EXCEPTION);
                        }
                    })
                    .catch(err => {
                        return reject(err);
                    })

            } else {
                try {
                    Car.create(newCar)
                        .exec((err, data) => {
                            if (err) return reject(err)

                            resolve(data);
                        })

                } catch (err) {
                    return reject(APIErrors.EXCEPTION);
                }

            }
        })
    }

};
