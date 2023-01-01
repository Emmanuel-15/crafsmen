/**
 * ServicePriceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    /**
     * Action for 'GET' /contractor-services
     * @param req
     * @param res
     * @returns {*}
     */
    getAll: async function (req, res) {
        const query = `SELECT service_price_id AS "servicePriceId",
        Services.service_title AS "serviceTitle",
        Contractors.contractor_name AS "contractorName",
        unit,
        unit_price AS "unitPrice",
        discount_price AS "discountPrice",
        ServicePrice.created_date As "createdDate"
        FROM ServicePrice, Services, Contractors
        WHERE ServicePrice.service_id = Services.service_id
        AND ServicePrice.contractor_id = Contractors.contractor_id
        AND ServicePrice.is_active = true
        ORDER BY service_price_id ASC`;

        try {
            await ServicePrice.getDatastore().sendNativeQuery(query, function (err, data) {
                console.log(err)
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_SERVICE_PRICE"));
                else if (data && data.rows.length == 0)
                    return res.ok("NO_SERVICE_PRICE_FOUND");
                else
                    res.ok("SERVICE_PRICE", data.rows);
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


        const query = `SELECT service_price_id AS "servicePriceId",
            Services.service_title AS "serviceTitle",
            Contractors.contractor_name AS "contractorName",
            unit,
            unit_price AS "unitPrice",
            discount_price AS "discountPrice",
            ServicePrice.created_date As "createdDate"
            FROM Services, Contractors, ServicePrice
            WHERE ServicePrice.service_id = Services.service_id
            AND ServicePrice.contractor_id = Contractors.contractor_id
            AND ServicePrice.is_active = true
            AND ServicePrice.service_price_id = $1`;

        try {
            await ServicePrice.getDatastore().sendNativeQuery(query, [req.param('id')], function (err, data) {
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_CONTRACTOR_SERVICES"));
                else if (data && data.rows.length == 0)
                    return res.ok("NO_SERVICE_PRICE_FOUND");
                else
                    res.ok("SERVICE_PRICE", data.rows);
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

        const newServicePrice = {
            serviceId: req.body.serviceId,
            contractorId: req.body.contractorId,
            unit: req.body.unit,
            unitPrice: req.body.unitPrice,
            discountPrice: req.body.discountPrice,
        };

        const schema = {
            type: 'object',
            required: ['serviceId', 'contractorId', 'unitPrice'],
            properties: {
                serviceId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_SERVICE_ID'
                    }
                },
                contractorId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_CONTRACTOR_ID'
                    }
                },
                unit: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_UNIT'
                    }
                },
                unitPrice: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_PRICE'
                    }
                },
                discountPrice: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_DISCOUNT_PRICE'
                    }
                }

            }, errorMessage: {
                type: 'should be an object',
                required: {
                    serviceId: 'SERVICE_ID_IS_REQUIRED',
                    contractorId: 'CONTRACTOR_ID_IS_REQUIRED',
                    unitPrice: 'uUNIT_PRICE_IS_REQUIRED',
                }
            }
        }

        const validations = Utils.validate(schema, newServicePrice);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            if (!await Services.findOne({ serviceId: newServicePrice.serviceId, isActive: true }))
                return res.badRequest(Utils.jsonErr("SERVICE_ID_NOT_PRESENT"));

            if (!await Contractors.findOne({ contractorId: newServicePrice.contractorId, isActive: true }))
                return res.badRequest(Utils.jsonErr("CONTRACTOR_ID_NOT_PRESENT"));

            const check = await ServicePrice.findOne({ serviceId: newServicePrice.serviceId, contractorId: newServicePrice.contractorId, isActive: true });

            if (check)
                return res.forbidden(Utils.jsonErr("SERVICE_PRICE_ALREADY_EXISTS"));

            await ServicePrice
                .create(newServicePrice)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_CREATING_SERVICE_PRICES"));
                    else
                        return res.created("SERVICE_PRICES_CREATED");
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

        const updateServicePrice = {
            unit: req.body.unit,
            unitPrice: req.body.unitPrice,
            discountPrice: req.body.discountPrice
        };

        const schema = {
            type: 'object',
            properties: {
                unit: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_UNIT'
                    }
                },
                unitPrice: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_PRICE'
                    }
                },
                discountPrice: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_DISCOUNT_PRICE'
                    }
                }

            }, errorMessage: {
                type: 'should be an object'
            }
        }

        const validations = Utils.validate(schema, updateServicePrice);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            const check = await ServicePrice.findOne({ servicePriceId: id, isActive: true });

            if (!check)
                return res.badRequest(Utils.jsonErr("SERVICE_PRICE_NOT_FOUND"));

            await ServicePrice.updateOne({ servicePriceId: id }).set(updateServicePrice)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_SERVICE_PRICE"));
                    else
                        return res.ok("SERVICE_PRICE_UPDATED");
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
            const check = await ServicePrice.findOne({ servicePriceId: req.param('id'), isActive: true });

            if (!check)
                return res.badRequest(Utils.jsonErr("SERVICE_PRICE_NOT_FOUND"));

            await ServicePrice.updateOne({ servicePriceId: req.param('id') }).set({ isActive: false })
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_SERVICE_PRICE"));

                    res.ok("SERVICE_PRICE_DELTED");
                });
        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};