/**
 * Utils
 * @type {object}
 */
const Ajv = require('ajv');
const addFormats = require("ajv-formats");
const APIErrors = require('../constants/APIErrors');

const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv /*, {singleError: true} */)
addFormats(ajv)

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
		return new Promise((resolve, reject) => {
			if (req.method !== requestType)
				return res.notFound();


			if (hasParams) {
				console.log("rejected")
				if (_.isEmpty(req.param))
					reject(APIErrors.NOT_ALLOWED);
				// return res.badRequest(Utils.jsonErr("NO_PARAMS_FOUND"));
			}


			if (hasBody) {
				if (_.isEmpty(req.body))
					return res.badRequest(Utils.jsonErr("EMPTY_BODY"));
			}
		})
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
