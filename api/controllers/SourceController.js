/**
 * SourceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// const SourcingType = require("../models/SourcingType");
const Utils = require("../services/Utils");

module.exports = {

    getallsourcing: async function (req, res) {
        if (req.method != 'GET') {
            res.badRequest(Utils.jsonErr("NOT_FOUND"));
        }

        try {
            SourcingType
                .find((req.user.is_admin) ? { isActive: true } : { createdBy: req.user.login_username, isActive: true })
                .exec((err, data) => {
                    if (err) return err;
                    if (data.isActive == false) {
                        return res.badRequest(Utils.jsonErr("NO_DATA_FOUND"))
                    }
                    if (data == undefined) return res.badRequest(Utils.jsonErr("NO_DATA_FOUND"));
                    res.ok('USERS_DATA', data)
                })
        }
        catch (e) {
            console.log("Exception", e);
        }
    },

    getsourcing: function (req, res) {
        if (!req.query || Object.keys(req.query).length == 0) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        try {
            SourcingType
                .findOne({ id: req.query.id, createdBy: req.user.login_username })
                .exec((err, data) => {
                    if (err) return res.badRequest(Utils.jsonErr(err));
                    if (data == undefined) return res.badRequest(Utils.jsonErr("NO_SOURCE_FOUND"));
                    if (data.isActive == false) {
                        return res.badRequest(Utils.jsonErr("NO_SOURCE_FOUND"))
                    } else {
                        res.ok('USER_DATA', data)
                    }
                })
        }
        catch (e) {
            console.log("Exception:", e)
        }
    },

    create: async function (req, res) {

        if (!req.body || Object.keys(req.body).length == 0) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        const sourcingtype = req.body.sourcingType;
        const isactive = true;
        const createdby = req.user.login_username;

        try {
            SourcingType
                .findOne({ sourcingType: sourcingtype })
                .exec((err, data) => {
                    if (err) return res.badRequest(Utils.jsonErr(err));
                    else if (data) return res.badRequest(Utils.jsonErr('SOURCING_TYPE_ALREADY_EXISTS'));
                    else {
                        SourcingType
                            .create({ sourcingType: sourcingtype, isActive: isactive, createdBy: createdby }).exec((err, user) => {
                                if (err) return res.badRequest(Utils.jsonErr(err));

                                return res.ok('SOURCE_CREATED_SUCCESSFULLY');
                            })
                    }
                })
        } catch (e) {
            console.log("Exception", e)
        }
    },

    update: async function (req, res) {
        if (!req.body || Object.keys(req.body).length == 0) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        const check = await SourcingType.findOne({ id: req.query.id });
        if (check == undefined || check.isActive == false || check.createdBy != req.user.login_username) return res.badRequest(Utils.jsonErr('NO_SOURCING_FOUND_TO_BE_UPDATED'));

        const sourcetype = req.body.sourceType;

        try {
            const result = await SourcingType.updateOne({ id: req.query.id }).set({ sourcingType: sourcetype });
            if (result == undefined) return res.badRequest(Utils.jsonErr('NO_SOURCING_FOUND_TO_BE_UPDATED'));
            else return res.ok('SOURCE_UPDATED_SUCCESSFULLY');

        } catch (e) {
            console.log("Exception", e);
        }
    },

    delete: async function (req, res) {
        console.log("start")

        if (!req.query || Object.keys(req.query).length == 0) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        try {
            const check = await SourcingType.findOne({ id: req.query.id })
            if (check == undefined || check.isActive == false || check.createdBy != req.user.login_username) return res.badRequest(Utils.jsonErr('SOURCE_NOT_FOUND'));
            else {
                SourcingType
                    .updateOne({ id: req.query.id })
                    .set({ isActive: false })
                    .exec((err, data) => {
                        if (err) return err;
                        if (data == undefined) return res.badRequest(Utils.jsonErr('SOURCE_NOT_FOUND'));

                        res.ok('SOURCE_DELETED_SUCCESSFULLY');
                    })
            }

        } catch (e) {
            console.log("Exception", e)
        }

    }

};

