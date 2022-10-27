const API_ERRORS = require('../constants/APIErrors');
const md5 = require('md5');

module.exports = {

	/**
	 * Returns an object with error field for response
	 * @param errorMessage {string}
	 * @returns {{err_msg: {string}}}
	 */

	uploadFile: function (req, newCarModel) {
		return new Promise((resolve, reject) => {
			// setting allowed file types
			var allowedTypes = ['image/jpeg', 'image/png'];

			const monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];

			let year = new Date().getFullYear();
			let month = new Date().getMonth();
			let date = new Date().getDate();


			// skipper default upload directory .tmp/uploads/
			// var allowedDir = "../../uploads";

			// do not define dirname, use default path
			req.file("modelImage").upload({
				maxBytes: 10000000,
				dirname: '../../uploads/models' + '/' + year + '/' + monthNames[month] + '/' + date,

				saveAs: function (file, cb) {
					if (file.byteCount > 10000000)
						return reject(API_ERRORS.LARGE_FILE);

					var d = new Date();
					var extension = file.filename.split('.').pop();

					// generating unique filename with extension
					var uuid = md5(d.getMilliseconds()) + "." + extension;

					// seperate allowed and disallowed file types
					if (allowedTypes.indexOf(file.headers['content-type']) === -1) {
						// save as disallowed files default upload path
						// cb(null, uuid);
						return reject(API_ERRORS.NOT_ALLOWED);
					} else {
						// save as allowed files
						cb(null, uuid);

						// cb(null, allowedDir + "/" + uuid);
					}
				}
			}, function whenDone(err, files) {
				if (err)
					return reject(err);

				newCarModel.modelImage = files[0].fd;

				resolve(newCarModel);
			});
		})
	},


	createCarModel: function (req, newCarModel) {
		return new Promise(async (resolve, reject) => {
			if (req._fileparser.upstreams.length >= 1) {
				await CarModelManager
					.uploadFile(req, newCarModel)
					.then((data) => {
						newCarModel = data;
					})
					.catch(err => {
						return reject(err);
					})
			} else {
				try {
					CarModelManager
						.create(newCarModel)
						.then((err, data) => {
							if (err) return reject(err)

							resolve(data)
						})
				} catch (err) {
					return reject(API_ERRORS.EXCEPTION);
				}
			}
		})
	},


	create: function (newCarModel) {
		return new Promise((resolve, reject) => {
			try {
				Car_model
					.create(newCarModel)
					.exec((err, data) => {
						if (err) reject(err)

						resolve(data);
					})

			} catch (err) {
				return res.serverError("EXCEPTION");
			}
		})
	},


	group(arr) {
		return new Promise((resolve, reject) => {
			if (!arr)
				reject();


			let local_var = {};
			const res = [];

			arr.forEach(el => {
				if (!local_var[el.carCategoryId]) {
					local_var[el.carCategoryId] = {
						carCategoryId: el.carCategoryId, carCategoryName: el.carCategoryName, models: []
					};
					res.push(local_var[el.carCategoryId]);
				};

				delete el.carCategoryName;
				local_var[el.carCategoryId].models.push(el);

			}, {});
			resolve(res);
		})
	},


	updateModel(req, updateCarModel) {
		return new Promise(async (resolve, reject) => {
			if (req._fileparser.upstreams.length >= 1) {
				await CarModelManager
					.uploadFile(req, updateCarModel)
					.then((data) => {
						updateCarModel = data;
					})
					.catch(err => {
						return res.badRequest(Utils.jsonErr(err));
					})
			}

			Car_model
				.updateOne({ carModelId: req.param('car_model_id') })
				.set(updateCarModel)
				.exec((err, data) => {
					if (err) reject(err)

					resolve(data)
				})
		})
	}
};
