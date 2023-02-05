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
        // const pageNo = (req.query.page) ? ((req.query.page) * 10) : 0;

        const query = `SELECT contractor_service_id AS "contractorServiceId",
            Contractors.contractor_name AS "contractor_name",
            Services.service_title AS "serviceTitle",
            ContractorServices.created_date AS "createdDate"
            FROM ContractorServices, Services, Contractors
            WHERE ContractorServices.contractor_id = Contractors.contractor_id
            AND ContractorServices.service_id = Services.service_id
            AND ContractorServices.is_active = true
            ORDER BY ContractorServices.contractor_service_id DESC`;

        try {
            await ContractorServices.getDatastore().sendNativeQuery(query, function (err, data) {
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_CONTRACTOR_SERVICES"));
                else if (!data || data.rows.length == 0)
                    return res.ok("NO_CONTRACTOR_SERVICES_FOUND");
                else
                    res.ok("CONTRACTOR_SERVICES", data.rows);
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

        const query = `SELECT contractor_service_id AS "contractorServiceId",
            Contractors.contractor_name AS "contractor_name",
            Services.service_title AS "serviceTitle",
            ContractorServices.created_date AS "createdDate"
            FROM ContractorServices, Services, Contractors
            WHERE ContractorServices.service_id = Services.service_id
            AND ContractorServices.contractor_id = Contractors.contractor_id
            AND ContractorServices.is_active = true
            AND ContractorServices.contractor_service_id = $1`;

        try {
            await ContractorServices.getDatastore().sendNativeQuery(query, [req.param('id')], function (err, data) {
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_CONTRACTOR_SERVICES"));
                else if (data && data.rows.length == 0)
                    return res.ok("NO_CONTRACTOR_SERVICES_FOUND");
                else
                    res.ok("CONTRACTOR_SERVICES", data.rows);
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
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

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
                    minimum: 1,
                    errorMessage: {
                        type: 'INVALID_CONTRACTOR_ID',
                        minimum: 'INVALID_CONTRACTOR_ID'
                    }
                },
                serviceId: {
                    type: 'number',
                    minimum: 1,
                    errorMessage: {
                        type: 'INVALID_SERVICE_ID',
                        minimum: 'INVALID_CONTRACTOR_ID'
                    }
                }

            }, errorMessage: {
                required: {
                    contractorId: 'CONTRACTOR_ID_IS_MISSING',
                    serviceId: 'SERVICE_ID_IS_MISSING'
                }
            }
        }

        const validations = Utils.validate(schema, newcontractorService);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            newcontractorService.isActive = true;

            const check = await ContractorServices.findOne(newcontractorService);

            if (check)
                return res.forbidden(Utils.jsonErr("CONTRACTOR_SERVICE_ALREADY_EXISTS"));

            await ContractorServices
                .create(newcontractorService)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_CREATING_CONTRACTOR_SERVICE"));
                    else
                        return res.created("CONTRACTOR_SERVICE_CREATED");
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
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

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
                    minimum: 1,
                    errorMessage: {
                        type: 'INVALID_CONTRACTOR_ID',
                        minimum: 'INVALID_CONTRACTOR_ID'
                    }
                },
                serviceId: {
                    type: 'number',
                    minimum: 1,
                    errorMessage: {
                        type: 'INVALID_SERVICE_ID',
                        minimum: 'INVALID_SERVICE_ID'
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
            updateContractorService.isActive = true;

            const idExists = await ContractorServices.findOne({ contractorServiceId: id, isActive: true });

            if (!idExists)
                return res.badRequest(Utils.jsonErr("CONTRACTOR_SERVICE_ID_NOT_FOUND"))

            if (idExists.contractorId != updateContractorService.contractorId || idExists.serviceId != updateContractorService.serviceId) {
                const check = await ContractorServices.findOne(updateContractorService);

                if (check)
                    return res.badRequest(Utils.jsonErr("CONTRACTOR_SERVICES_ALREADY_EXISTS"));
            }

            await ContractorServices.updateOne({ contractorServiceId: id }).set(updateContractorService)
                .exec((err) => {
                    if (err) {
                        if (err.raw && err.raw.code && err.raw.code === '23503' && err.raw.constraint == 'contractors_contractorId_fkey')
                            return res.badRequest(Utils.jsonErr("CONTRACTOR_ID_DOES_NOT_EXIST"));

                        else if (err.raw && err.raw.code && err.raw.code === '23503' && err.raw.constraint == 'services_serviceId_fkey')
                            return res.badRequest(Utils.jsonErr("SERVICE_ID_DOES_NOT_EXIST"));

                        else
                            return res.badRequest(Utils.jsonErr("ERROR_UPDATING_CONTRACTOR_SERVICES"));
                    }
                    else
                        return res.ok("CONTRACTOR_SERVICE_UPDATED");
                });

        } catch (err) {
            console.log("err: ", err)
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
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

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