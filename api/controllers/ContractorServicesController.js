/**
 * ContractorServicesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Utils = require("../services/Utils");

module.exports = {

    /**
     * Action for 'GET' /contractor-services
     * @param req
     * @param res
     * @returns {*}
     */
    getAll: async function (req, res) {
        try {
            await ContractorServices.find({ isActive: true })
                .exec((err, data) => {
                    if (err || !data)
                        return res.ok("NO_CONTRACTOR_SERVICES_FOUND");
                    else
                        return res.ok("CONTRACTOR_SERVICES", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'GET' /contractor-services/:id
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
            await ContractorServices
                .findOne({ contractorServiceId: req.param('id'), isActive: true })
                .exec((err, data) => {
                    if (err || !data)
                        res.ok("NO_CONTRACTOR_SERVICES_FOUND");
                    else
                        res.ok("CONTRACTOR_SERVICES", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'POST' /contractor-services
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

        const newcontractorService = {
            contractorId: req.body.contractorId,
            serviceId: req.body.serviceId
        };

        const schema = {
            type: 'object',
            required: ['contractorId', 'serviceId'],
            properties: {
                contractorId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_CONTRACTOR_ID'
                    }
                },
                serviceId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_SERVICE_ID'
                    }
                }

            }, errorMessage: {
                type: 'should be an object',
                required: {
                    contractorId: 'CONTRACTOR_ID_IS_MISSING',
                    serviceId: 'SERVICE_ID_IS_MISSING'
                }
            },
            additionalProperties: false,
            errorMessage: "ONLY_CONTRACTOR_ID_AND_SERVICE_ID_IS_REQUIRED"
        }

        const validations = Utils.validate(schema, newcontractorService);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        if (isNaN(newcontractorService.contractorId) || isNaN(newcontractorService.serviceId))
            return res.badRequest(Utils.jsonErr("INVALID_ID'S"))

        try {
            const check = await ContractorServices.findOne({
                serviceId: newcontractorService.serviceId,
                contractorId: newcontractorService.contractorId,
                isActive: true
            });

            if (check)
                return res.forbidden(Utils.jsonErr("CONTRACTOR_SERVICES_ALREADY_EXISTS"));

            await ContractorServices
                .create(newcontractorService)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_CREATING_CONTRACTOR_SERVICE"));
                    else
                        return res.created("CONTRACTOR_SERVICES_CREATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'PUT' /contractor-services/:id
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

        const updateContractorService = {
            contractorId: req.body.contractorId,
            serviceId: req.body.serviceId
        };


        const schema = {
            type: 'object',
            required: ['contractorId', 'serviceId'],
            properties: {
                contractorId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_CONTRACTOR_ID'
                    }
                },
                serviceId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_SERVICE_ID'
                    }
                }

            }, errorMessage: {
                type: 'should be an object',
                required: {
                    contractorId: 'CONTRACTOR_ID_IS_MISSING',
                    serviceId: 'SERVICE_ID_IS_MISSING'
                }
            }
        }

        const validations = Utils.validate(schema, updateContractorService);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            const check = await ContractorServices.findOne({ contractorId: updateContractorService.contractorId, serviceId: updateContractorService.serviceId, isActive: true });

            if (check)
                return res.badRequest(Utils.jsonErr("CONTRACTOR_SERVICES_ALREADY_EXISTS"));

            await ContractorServices.updateOne({ contractorServiceId: id }).set(updateContractorService)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_CONTRACTOR_SERVICES"));
                    else
                        return res.ok("CONTRACTOR_SERVICES_UPDATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'DELETE' /contractor-services/:id
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
            const check = await ContractorServices.findOne({ contractorServiceId: req.param('id'), isActive: true })

            if (!check)
                return res.badRequest(Utils.jsonErr("CONTRACTOR_SERVICES_NOT_FOUND"));

            await ContractorServices.updateOne({ contractorServiceId: req.param('id') }).set({ isActive: false })
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_CONTRACTOR_SERVICES"));

                    res.ok("CONTRACTOR_SERVICES_DELTED");
                });
        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};