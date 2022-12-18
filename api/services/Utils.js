/**
 * Utils
 * @type {object}
 */
module.exports = {

	/**
	 * Returns an object with error field for response
	 * @param errorMessage {string}
	 * @returns {{err_msg: {string}}}
	 */
	jsonErr(errorMessage) {
		return {
			err_msg: errorMessage
		};
	},

	isValidRequest(req, res, requestType, hasParams, hasBody) {
		console.log("Started isValidRequest function.")
		if (req.method !== requestType)
			return res.notFound();


		if (hasParams) {
			if (!req.param || _.isEmpty(req.param))
				return res.badRequest(Utils.jsonErr("NO_PARAMS_FOUND"));
		}


		if (hasBody) {
			if (_.isEmpty(req.body))
				return res.badRequest(Utils.jsonErr("EMPTY_BODY"));
		}
		console.log("Finished isValidRequest function.");

	},

	validate(schema, newCarCategory, res) {
		const validate = ajv.compile(schema);
		const valid = validate(newCarCategory);

		if (!valid) {
			let errors = [];

			validate.errors.forEach((data) => {
				errors.push(data.message);
			})
			return res.badRequest(Utils.jsonErr(errors));
		}
		else {
			return res.ok("done");
		}
	}
};
