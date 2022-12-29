/**
 * Utils
 * @type {object}
*/
const APIErrors = require("../constants/APIErrors");

const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const ajvErrors = require('ajv-errors')

const ajv = new Ajv({ allErrors: true, $data: true });
addFormats(ajv);
ajvErrors(ajv);
ajv.addFormat('custom-date-time', function (dateTimeString) {
	// console.log("value: ", dateTimeString)
	// console.log("date: ", new Date(dateTimeString))

	if (typeof dateTimeString === 'object')
		dateTimeString = dateTimeString.toISOString();

	return !isNaN(Date.parse(dateTimeString));  // any test that returns true/false 
});

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

	isValidRequest(req, hasParams, hasBody) {
		if (hasParams) {
			if (!req.params || _.isEmpty(req.params))
				return APIErrors.NO_PARAMS;
		}

		if (hasBody) {
			let empty_Field = null;

			_.valuesIn(req.body).forEach(val => {
				if (val.length == 0)
					return empty_Field = APIErrors.REQUIRED;
			});

			if (empty_Field)
				return empty_Field;

			if (_.isEmpty(req.body))
				return APIErrors.NO_BODY;
		}
	},

	validate(schema, data) {
		const validate = ajv.compile(schema)
		const valid = validate(data);

		if (!valid) {
			let errors = [];

			validate.errors.forEach((data) => {
				errors.push(data.message);
			})
			return errors;
		}
		else {
			return;
		}
	}
};