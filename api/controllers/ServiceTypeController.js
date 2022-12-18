/**
 * ServiceTypeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {

    getAll: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();


        try {
            await ServiceType.find()
                .exec((err, data) => {
                    if (err || data.length == 0)
                        return res.ok("NO_SERVICE_TYPE_FOUND");
                    else
                        return res.ok("SERVICE_TYPE", data);
                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    },


    get: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


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
                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    },


    create: async function (req, res) {
        if (req.method !== 'POST')
            return res.notFound();


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        const newServiceType = { serviceType: req.body.serviceType };


        const check = await ServiceType.findOne({ serviceType: newServiceType.serviceType });

        if (check)
            return res.forbidden(Utils.jsonErr("SERVICE_TYPE_ALREADY_EXISTS"));    //use 403 status code. for already existing 


        try {
            await ServiceType
                .create(newServiceType)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr(err));
                    else
                        return res.created("SERVICE_TYPE_CREATED");
                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    },


    update: async function (req, res) {
        if (req.method !== 'PUT')
            return res.notFound();


        if (!req.body || _.keys(req.body).length == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        if (!req.param || req.param.length != 2)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        const id = req.param("id");
        const updateServiceType = { serviceType: req.body.serviceType, };


        if (isNaN(id))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        const idExists = await ServiceType.findOne({ serviceTypeId: id });

        if (!idExists)
            return res.badRequest(Utils.jsonErr("NO_SERVICE_TYPE_FOUND"));


        const ServiceExists = await ServiceType.findOne({ serviceType: updateServiceType.serviceType });

        if (ServiceExists)
            return res.badRequest(Utils.jsonErr("SERVICE_TYPE_ALREADY_EXISTS"));


        try {
            await ServiceType.updateOne({ serviceTypeId: id }).set(updateServiceType)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_SERVICE_TYPE"));
                    else
                        return res.ok("SERVICE_TYPE_UPDATED");
                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    },


    delete: async function (req, res) {
        if (req.method !== 'DELETE')
            return res.notFound();


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        const check = await ServiceType.findOne({ serviceTypeId: req.param('id') });

        if (!check)
            return res.badRequest(Utils.jsonErr("SERVICE_TYPE_NOT_FOUND"));


        try {
            ServiceType.destroy({ serviceTypeId: req.param('id') })
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_SERVICE_TYPE"));


                    res.ok("SERVICE_TYPE_DELTED");
                })
        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    }

};

