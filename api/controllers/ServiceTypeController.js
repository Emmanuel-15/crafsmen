/**
 * ServiceTypeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Utils = require("../services/Utils");

module.exports = {

    /**
     * Action for 'GET' /service-type
     * @param req
     * @param res
     * @returns {*}
     */
    getAll: async function (req, res) {
        const pageNo = (req.query.page) ? ((req.query.page) * 10) : 0;

        try {
            await ServiceType.find()
                .sort('serviceTypeId DESC')
                .paginate(pageNo, 10)
                .exec((err, data) => {
                    if (err)
                        return res.ok("ERROR_WHILE_FETCHING_SERVICE_TYPE");
                    else if (!data || data.length == 0)
                        return res.ok("NO_SERVICE_TYPE_FOUND");
                    else
                        return res.ok("SERVICE_TYPE", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'GET' /service-type/:id
     * @param req
     * @param res
     * @returns {*}
     */
    get: async function (req, res) {
        const validReq = await Utils.isValidRequest(req, true, false);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));

        try {
            await ServiceType
                .findOne({ serviceTypeId: req.param('id') })
                .exec((err, data) => {
                    if (err || !data)
                        res.ok("NO_SERVICE_TYPE_FOUND");
                    else
                        res.ok("SERVICE_TYPE", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'POST' /service-type
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

        const newServiceType = { serviceType: req.body.serviceType };
        //    { serviceType: newServiceType.serviceType }

        const schema = {
            type: 'object',
            required: ['serviceType'],
            properties: {
                serviceType: {
                    type: 'string',
                    minLength: 3,
                    errorMessage: {
                        type: 'INVALID_SERVICE_TYPE',
                        minLength: 'MIN_3_CHAR_REQUIRED'
                    }
                }
            }, errorMessage: {
                required: {
                    serviceType: 'SERVICE_TYPE_IS_REQUIRED'
                }
            }
        }

        const validations = Utils.validate(schema, newServiceType);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            const check = await ServiceType.findOne(newServiceType);

            if (check)
                return res.forbidden(Utils.jsonErr("SERVICE_TYPE_ALREADY_EXISTS"));

            await ServiceType
                .create(newServiceType)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr(err));
                    else
                        return res.created("SERVICE_TYPE_CREATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'PUT' /service-type
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

        const updateServiceType = { serviceType: req.body.serviceType };

        const schema = {
            type: 'object',
            required: ['serviceType'],
            properties: {
                serviceType: {
                    type: 'string',
                    minLength: 1,
                    errorMessage: {
                        type: 'INVALID_SERVICE_TYPE',
                        minLength: 'SERVICE_TYPE_IS_REQUIRED'
                    }
                }
            }, errorMessage: {
                type: 'should be an object',
                required: {
                    serviceType: 'SERVICE_TYPE_IS_REQUIRED'
                }
            }
        }

        const validations = Utils.validate(schema, updateServiceType);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            const idExists = await ServiceType.findOne({ serviceTypeId: id });

            if (!idExists)
                return res.badRequest(Utils.jsonErr("NO_SERVICE_TYPE_FOUND"));

            if (idExists.serviceType != updateServiceType.serviceType) {
                const ServiceExists = await ServiceType.findOne({ serviceType: updateServiceType.serviceType });

                if (ServiceExists)
                    return res.badRequest(Utils.jsonErr("SERVICE_TYPE_ALREADY_EXISTS"));

            }

            await ServiceType.updateOne({ serviceTypeId: id }).set(updateServiceType)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_SERVICE_TYPE"));
                    else
                        return res.ok("SERVICE_TYPE_UPDATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'DELETE' /service-type
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
            const check = await ServiceType.findOne({ serviceTypeId: req.param('id') });

            if (!check)
                return res.badRequest(Utils.jsonErr("SERVICE_TYPE_NOT_FOUND"));

            ServiceType.destroy({ serviceTypeId: req.param('id') })
                .exec((err) => {
                    if (err) {

                        if (err.raw && err.raw.code && err.raw.code === '23503')
                            return res.badRequest(Utils.jsonErr("SERVICE_TYPE_ALREADY_IN_USE"));
                        else
                            return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_SERVICE_TYPE"));
                    }

                    res.ok("SERVICE_TYPE_DELTED");
                });
        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};