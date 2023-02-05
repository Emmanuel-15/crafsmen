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

        // const pageNo = (req.query.page) ? ((req.query.page) * 10) : 0; // pagination

        const query = `SELECT service_id AS "serviceId",
            service_image AS "serviceImage",
            service_title AS "serviceTitle",
            service_description AS "serviceDescription",
            service_except AS "serviceExcept",
            Services.service_type_id AS "serviceTypeId",
            ServiceType.service_type AS "serviceType",
            Services.created_date AS "createdDate"
            FROM Services, ServiceType
            WHERE Services.service_type_id = ServiceType.service_type_id 
            AND is_active = true
            ORDER BY Services.service_id DESC`;

        try {
            await Services.getDatastore().sendNativeQuery(query, function (err, data) {
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_SERVICES"));
                else if (!data || data.rows.length == 0)
                    return res.ok("NO_SERVICE_TYPE_FOUND");
                else
                    return res.ok("SERVICES", data.rows);
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

        const query = `SELECT service_id AS "serviceId",
            service_image AS "serviceImage",
            service_title AS "serviceTitle",
            service_description AS "serviceDescription",
            service_except AS "serviceExcept",
            Services.service_type_id AS "serviceTypeId",
            ServiceType.service_type AS "serviceType",
            Services.created_date AS "CreatedDate"
            FROM Services, ServiceType
            WHERE  Services.service_type_id = ServiceType.service_type_id 
            AND is_active = true
            AND Services.service_id = $1
            ORDER BY Services.service_id DESC`;

        try {
            await Services.getDatastore().sendNativeQuery(query, [req.param('id')], function (err, data) {
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_SERVICES"));
                else if (!data || data.rows.length == 0)
                    return res.ok("NO_SERVICES_FOUND");
                else
                    res.ok("SERVICES", data.rows);
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
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

        const valid = await Utils.isValidRequest(req, false, true);

        if (valid)
            return res.badRequest(Utils.jsonErr(valid));

        const newService = {
            serviceTypeId: req.body.serviceTypeId,
            serviceTitle: req.body.serviceTitle,
            serviceDescription: req.body.serviceDescription,
            serviceImage: req.body.serviceImage,
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
                serviceImage: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_IMAGE_PATH'
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

        const check = await Services.findOne({ serviceTitle: newService.serviceTitle, isActive: true });

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
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

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
            serviceImage: req.body.serviceImage,
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
                    minLength: 1,
                    errorMessage: {
                        type: 'TITLE_SHOULD_BE_CHARACTERS',
                        minLength: 'SERVICE_TITLE_IS_REQUIRED'
                    }
                },
                serviceDescription: {
                    type: 'string',
                    minLength: 1,
                    errorMessage: {
                        type: 'DESCRIPTION_SHOULD_BE_CHARACTERS',
                        minLength: 'SERVICE_DESCRIPTION_IS_REQUIRED'
                    }
                },
                serviceImage: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_IMAGE_PATH'
                    }
                },
                serviceExcept: {
                    type: 'string',
                    minLength: 1,
                    errorMessage: {
                        type: 'EXCEPT_SHOULD_BE_CHARACTERS',
                        minLength: 'SERVICE_EXCEPT_IS_REQUIRED'
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

            if (updateService.serviceTitle != serviceExists.serviceTitle) {
                const check = await Services.findOne({ serviceTitle: updateService.serviceTitle, isActive: true });

                if (check)
                    return res.badRequest(Utils.jsonErr("SERVICE_TITLE_EXISTS"));
            }

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
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

        const validReq = await Utils.isValidRequest(req, true, false);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        try {
            const query = `SELECT services.service_id
            FROM services
                LEFT JOIN contractorservices ON contractorservices.service_id = services.service_id
                LEFT JOIN serviceprice ON serviceprice.service_id = services.service_id
            WHERE contractorservices.service_id = $1 OR
                serviceprice.service_id = $1
            LIMIT (1);`;

            const id_in_use = await Contractors.getDatastore().sendNativeQuery(query, [req.param('id')]);

            if (id_in_use && id_in_use.rows.length > 0)
                return res.badRequest(Utils.jsonErr("SERVICE_ID_IN_USE"));

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
    },

    getDetails: async function (req, res) {
        const validReq = await Utils.isValidRequest(req, true, false);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        const query = `SELECT service_id AS "serviceId",
        service_image AS "serviceImage",
        service_title AS "serviceTitle",
        service_description AS "serviceDescription",
        ServiceType.service_type AS "serviceType"
        FROM Services, ServiceType
        WHERE Services.service_type_id = ServiceType.service_type_id 
        AND is_active = true
        AND Services.service_id = $1
        ORDER BY Services.service_id DESC`;

        const query2 = `SELECT service_price_id AS "servicePriceId",
        Contractors.contractor_id AS "contractorId",
        Contractors.contractor_name AS "contractorName",
        unit,
        unit_price AS "unitPrice",
        discount_price AS "discountPrice"
        FROM Services, Contractors, ServicePrice
        WHERE ServicePrice.service_id = Services.service_id
        AND ServicePrice.contractor_id = Contractors.contractor_id
        AND ServicePrice.is_active = true
        AND Services.service_id = $1`;

        try {
            if (!await Services.findOne({ serviceId: req.param('id'), isActive: true }))
                return res.badRequest(Utils.jsonErr("NO_SERVICE_FOUND"));

            const service = await Services.getDatastore().sendNativeQuery(query, [req.param('id')]);

            const prices = await ServicePrice.getDatastore().sendNativeQuery(query2, [req.param('id')]);

            let group = service.rows[0];

            group.prices = prices.rows;

            return res.ok("SERVICE_DETAILS", group);

        } catch (err) {
            return res.serverError("EXCEPTION");
        }
    }
};