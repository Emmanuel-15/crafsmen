/**
 * ContractorsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Utils = require("../services/Utils");

function doesNameExist(name) {
    return Contractors.findOne({ contractorName: name });
}

function doesNumberExist(number, col) {
    let obj;

    if (col)
        obj = { contactNumber1: number };
    else
        obj = { contactNumber2: number };

    return Contractors.findOne(obj);
}

function doesEmailExist(email) {
    return Contractors.findOne({ contractorEmail: email });
}

module.exports = {


    /**
     * Action for 'GET' /contractors
     * @param req
     * @param res
     * @returns {*}
     */
    getAll: async function (req, res) {
        try {
            await Contractors.find({ isActive: true })
                .sort('contractorId DESC')
                .exec((err, data) => {
                    if (err || data.length == 0)
                        return res.ok("NO_CONTRACTORS_FOUND");
                    else
                        return res.ok("CONTRACTORS", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'GET' /contractors/:id
     * @param req
     * @param res
     * @returns {*}
     */
    get: async function (req, res) {
        const validReq = await Utils.isValidRequest(req, true, false);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        try {
            await Contractors
                .findOne({ contractorId: req.param('id'), isActive: true })
                .exec((err, data) => {
                    if (err || !data)
                        res.ok("NO_CONTRACTOR_FOUND");
                    else
                        res.ok("CONTRACTOR", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'POST' /contractors
     * @param req
     * @param res
     * @returns {*}
     */
    create: async function (req, res) {
        if (req.user.isAdmin != true)
            return res.forbidden("NOT_ALLOWED");

        const validReq = await Utils.isValidRequest(req, false, true);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        const newContractor = {
            contractorName: req.body.contractorName,
            contractorAddress: req.body.contractorAddress,
            contactNumber1: req.body.contactNumber1,
            contactNumber2: req.body.contactNumber2,
            contractorEmail: req.body.contractorEmail,
        };

        const schema = {
            type: 'object',
            required: ['contractorName', 'contractorAddress', 'contactNumber1', 'contractorEmail'],
            properties: {
                contractorName: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_NAME'
                    }
                },
                contractorAddress: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_ADDRESS'
                    }
                },
                contactNumber1: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_PHONE_NUMBER'
                    }
                },
                contactNumber2: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_PHONE_NUMBER'
                    }
                },
                contractorEmail: {
                    type: 'string',
                    format: 'email',
                    errorMessage: {
                        type: 'EMAIL_SHOUL_BE_STRING',
                        format: 'INVALID_EMAIL'
                    }
                }

            }, errorMessage: {
                required: {
                    contractorName: 'CONTRACTOR_NAME_IS_REQUIRED',
                    contractorAddress: 'CONTRACTOR_ADDRESS_IS_REQUIRED',
                    contactNumber1: 'MIN_1_CONTACT_NUMBER_IS_REQUIRED',
                    contractorEmail: 'CONTRACTOR_EMAIL_IS_REQUIRED'
                }
            }
        }

        const validations = Utils.validate(schema, newContractor);

        if (validations) {
            // const obj = Object.assign({}, validations); // converts array to object
            // return res.badRequest(Utils.jsonErr(obj));

            return res.badRequest(Utils.jsonErr(validations));
        }

        if (newContractor.contactNumber2 && newContractor.contactNumber1 == newContractor.contactNumber2)
            return res.badRequest(Utils.jsonErr("PROVIDE_DIFFERENT_NUMBERS"));

        if (await doesNameExist(newContractor.contractorName))
            return res.forbidden(Utils.jsonErr("NAME_ALREADY_IN_USE"));

        if (await doesNumberExist(newContractor.contactNumber1, 1))
            return res.forbidden(Utils.jsonErr("CONTACT_NUMBER_1_ALREADY_IN_USE"));

        if (newContractor.contactNumber2 && await doesNumberExist(newContractor.contactNumber2))
            return res.forbidden(Utils.jsonErr("CONTACT_NUMBER_2_ALREADY_IN_USE"));

        if (await doesEmailExist(newContractor.contractorEmail))
            return res.forbidden(Utils.jsonErr("EMAIL_ALREADY_IN_USE"));

        try {
            await Contractors
                .create(newContractor)
                .exec((err) => {
                    if (err)
                        return res.badRequest("ERROR_WHILE_CREATING_CONTRACTOR");
                    else
                        return res.created("CONTRACTOR_CREATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'PUT' /contractors/:id
     * @param req
     * @param res
     * @returns {*}
     */
    update: async function (req, res) {
        if (req.user.isAdmin != true)
            return res.forbidden("NOT_ALLOWED");

        const validReq = await Utils.isValidRequest(req, true, true);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        const id = req.param("id");

        if (isNaN(id))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        const updateContractor = {
            contractorName: req.body.contractorName,
            contractorAddress: req.body.contractorAddress,
            contactNumber1: req.body.contactNumber1,
            contactNumber2: req.body.contactNumber2,
            contractorEmail: req.body.contractorEmail
        };

        const schema = {
            type: 'object',
            properties: {
                contractorName: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_NAME'
                    }
                },
                contractorAddress: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_ADDRESS'
                    }
                },
                contactNumber1: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_PHONE_NUMBER_1'
                    }
                },
                contactNumber2: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_PHONE_NUMBER_2'
                    }
                },
                contractorEmail: {
                    type: 'string',
                    format: 'email',
                    errorMessage: {
                        type: 'EMAIL_SHOUL_BE_STRING',
                        format: 'INVALID_EMAIL'
                    }
                }
            }
        }

        const validations = Utils.validate(schema, updateContractor);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            const idExists = await Contractors.findOne({ contractorId: id, isActive: true });

            if (!idExists)
                return res.badRequest(Utils.jsonErr("NO_CONTRACTOR_FOUND"));

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

        if (updateContractor.contactNumber2 && (updateContractor.contactNumber1 == updateContractor.contactNumber2))
            return res.badRequest(Utils.jsonErr("PROVIDE_DIFFERENT_NUMBERS"));

        if (updateContractor.contractorName && await doesNameExist(updateContractor.contractorName))
            return res.forbidden(Utils.jsonErr("NAME_ALREADY_IN_USE"));

        if (updateContractor.contactNumber1 && await doesNumberExist(updateContractor.contactNumber1, 1))
            return res.forbidden(Utils.jsonErr("CONTACT_NUMBER_1_ALREADY_IN_USE"));

        if (updateContractor.contactNumber2 && await doesNumberExist(updateContractor.contactNumber2))
            return res.forbidden(Utils.jsonErr("CONTACT_NUMBER_2_ALREADY_IN_USE"));

        if (updateContractor.contractorEmail && await doesEmailExist(updateContractor.contractorEmail))
            return res.forbidden(Utils.jsonErr("EMAIL_ALREADY_IN_USE"));

        try {
            await Contractors.updateOne({ contractorId: id }).set(updateContractor)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_CONTRACTOR"));
                    else
                        return res.ok("CONTRACTOR_UPDATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'DELETE' /contractors/:id
     * @param req
     * @param res
     * @returns {*}
     */
    delete: async function (req, res) {
        if (req.user.isAdmin != true)
            return res.forbidden("NOT_ALLOWED");

        const validReq = await Utils.isValidRequest(req, true, false);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        try {
            const check = await Contractors.findOne({ contractorId: req.param('id'), isActive: true });

            if (!check)
                return res.badRequest(Utils.jsonErr("CONTRACTOR_NOT_FOUND"));

            Contractors.updateOne({ contractorId: req.param('id') })
                .set({ isActive: false })
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_CONTRACTOR"));
                    else
                        res.ok("CONTRACTOR_DELTED");
                });
        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};