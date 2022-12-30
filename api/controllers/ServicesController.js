/**
 * ServicesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Utils = require("../services/Utils");

module.exports = {

    /**
     * Action for 'GET' /services
     * @param req
     * @param res
     * @returns {*}
     */
    getAll: async function (req, res) {
        const validReq = await Utils.isValidRequest(req, false, false);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        try {
            await Services.find({ isActive: true })
                .populate('serviceTypeId')
                .exec((err, data) => {
                    if (err || data.length == 0)
                        return res.ok("NO_SERVICES_FOUND");
                    else
                        return res.ok("SERVICES", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'GET' /services/:id
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
            await Services
                .findOne({ serviceId: req.param('id'), isActive: true })
                .exec((err, data) => {
                    if (err || !data)
                        res.ok("NO_SERVICE_FOUND");
                    else
                        res.ok("SERVICE", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'POST' /services
     * @param req
     * @param res
     * @returns {*}
     */
    create: async function (req, res) {
        if (req.user.isAdmin != true)
            return res.forbidden("NOT_ALLOWED");

        const valid = await Utils.isValidRequest(req, false, true);

        if (valid)
            return res.badRequest(Utils.jsonErr(valid));

        const newService = {
            serviceTypeId: req.body.serviceTypeId,
            serviceTitle: req.body.serviceTitle,
            serviceDescription: req.body.serviceDescription,
            serviceExcept: req.body.serviceExcept
        };

        const schema = {
            type: 'object',
            required: ['serviceTypeId', 'serviceTitle', 'serviceDescription', 'serviceExcept'],
            properties: {
                serviceTypeId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_SERVICE_ID'
                    }
                },
                serviceTitle: {
                    type: 'string',
                    errorMessage: {
                        type: 'TITLE_SHOULD_BE_CHARACTERS'
                    }
                },
                serviceDescription: {
                    type: 'string',
                    errorMessage: {
                        type: 'DESCRIPTION_SHOULD_BE_CHARACTERS'
                    }
                },
                serviceExcept: {
                    type: 'string',
                    errorMessage: {
                        type: 'EXCEPT_SHOULD_BE_CHARACTERS'
                    }
                }

            }, errorMessage: {
                type: 'should be an object',
                required: {
                    serviceTypeId: 'SERVICE_TYPE_ID_IS_REQUIRED',
                    serviceTitle: 'SERVICE_TITLE_IS_REQUIRED',
                    serviceDescription: 'SERVICE_DESCRIPTION_IS_REQUIRED',
                    serviceExcept: 'SERVICE_EXCEPT_IS_REQUIRED'
                }
            }
        }

        const validations = Utils.validate(schema, newService);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        const check = await Services.findOne({ serviceTitle: newService.serviceTitle });

        if (check)
            return res.forbidden(Utils.jsonErr("SERVICE_ALREADY_EXISTS"));

        try {
            await Services
                .create(newService)
                .exec((err) => {
                    if (err) {
                        if (err.raw && err.raw.code && err.raw.code === '23503')
                            return res.badRequest(Utils.jsonErr("SERVICE_TYPE_NOT_PRESENT"));
                        else
                            return res.badRequest(Utils.jsonErr("ERROR_WHILE_CREATING_SERVICE"));
                    }
                    else
                        return res.created("SERVICE_CREATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'PUT' /services/:id
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

        const updateService = {
            serviceTypeId: req.body.serviceTypeId,
            serviceTitle: req.body.serviceTitle,
            serviceDescription: req.body.serviceDescription,
            serviceExcept: req.body.serviceExcept
        };

        const schema = {
            type: 'object',
            properties: {
                serviceTypeId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_SERVICE_ID'
                    }
                },
                serviceTitle: {
                    type: 'string',
                    errorMessage: {
                        type: 'TITLE_SHOULD_BE_CHARACTERS'
                    }
                },
                serviceDescription: {
                    type: 'string',
                    errorMessage: {
                        type: 'DESCRIPTION_SHOULD_BE_CHARACTERS'
                    }
                },
                serviceExcept: {
                    type: 'string',
                    errorMessage: {
                        type: 'EXCEPT_SHOULD_BE_CHARACTERS'
                    }
                }

            }, errorMessage: {
                type: 'should be an object'
            }
        }

        const validations = Utils.validate(schema, updateService);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            const serviceExists = await Services.findOne({ serviceId: id, isActive: true });

            if (!serviceExists)
                return res.badRequest(Utils.jsonErr("NO_SERVICE_FOUND"));

            const check = await Services.findOne({ serviceTitle: updateService.serviceTitle, isActive: true });

            if (check)
                return res.badRequest(Utils.jsonErr("SERVICE_ALREADY_EXISTS"));

            await Services.updateOne({ serviceId: id }).set(updateService)
                .exec((err) => {
                    if (err) {
                        if (err.raw && err.raw.code && err.raw.code === '23503')
                            return res.badRequest(Utils.jsonErr("SERVICE_TYPE_DOES_NOT_EXIST"));
                        else
                            return res.badRequest(Utils.jsonErr("ERROR_UPDATING_SERVICE"));
                    }
                    else
                        return res.ok("SERVICE_UPDATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'DELETE' /services/:id
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
            const check = await Services.findOne({ serviceId: req.param('id'), isActive: true });

            if (!check)
                return res.badRequest(Utils.jsonErr("SERVICE_NOT_FOUND"));

            Services.updateOne({ serviceId: req.param('id') })
                .set({ isActive: false })
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_SERVICE"));

                    res.ok("SERVICE_DELTED");
                });
        }
        catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};
