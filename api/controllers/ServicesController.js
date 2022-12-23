/**
 * ServicesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    /**
     * Action for 'GET' /services
     * @param req
     * @param res
     * @returns {*}
     */
    getAll: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();

        try {
            await Services.find({ isActive: true })
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
        if (req.method !== 'GET')
            return res.notFound();

        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));

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
        if (req.method !== 'POST')
            return res.notFound();

        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));

        const newService = {
            serviceTypeId: req.body.serviceTypeId,
            isActive: true,
            serviceTitle: req.body.serviceTitle,
            serviceDescription: req.body.serviceDescription,
            serviceExcept: req.body.serviceExcept
        };

        const check = await Services.findOne({ serviceTitle: newService.serviceTitle });

        if (check)
            return res.forbidden(Utils.jsonErr("SERVICE_ALREADY_EXISTS"));

        try {
            await Services
                .create(newService)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_CREATING_SERVICE"));
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
        if (req.method !== 'PUT')
            return res.notFound();

        if (!req.body || _.keys(req.body).length == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));

        if (!req.param || req.param.length != 2)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));

        const id = req.param("id");
        const updateService = {
            serviceTypeId: req.body.serviceTypeId,
            serviceTitle: req.body.serviceTitle,
            serviceDescription: req.body.serviceDescription,
            serviceExcept: req.body.serviceExcept
        };

        if (isNaN(id))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        const serviceExists = await Services.findOne({ serviceTypeId: id, isActive: true });

        if (!serviceExists)
            return res.badRequest(Utils.jsonErr("NO_SERVICE_FOUND"));

        const check = await Services.findOne({ serviceTitle: updateService.serviceTitle, isActive: true });

        if (check)
            return res.badRequest(Utils.jsonErr("SERVICE_ALREADY_EXISTS"));

        try {
            await Services.updateOne({ serviceId: id }).set(updateService)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_SERVICE"));
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
        if (req.method !== 'DELETE')
            return res.notFound();

        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        const check = await Services.findOne({ serviceId: req.param('id'), isActive: true });

        if (!check)
            return res.badRequest(Utils.jsonErr("SERVICE_NOT_FOUND"));

        try {
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
