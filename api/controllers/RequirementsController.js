/**
 * RequirementsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// const Requirements = require("../models/Requirements");
const { select } = require("sails-postgresql/helpers");
const Utils = require("../services/Utils");

module.exports = {

    getAllRequirement: async function (req, res) {
        if (req.method != 'GET') res.badRequest(Utils.jsonErr("NOT_FOUND"));

        try {
            let fetchArray = [
                'id',
                'userloginId',
                'projectTitle',
                'quantityNeeded',
                'targetPrice',
                'activeStep',
                'requirementStatus'
            ],
                whereCondition = {
                    id: req.query.id,
                    userloginId: req.user.id
                };

            await Requirements.find((req.user.is_admin) ? { select: [...fetchArray, 'isActive'] } : {
                select: [...fetchArray, 'isActive']
                , where: { ...whereCondition, isActive: true }
            }).populate('sourcingtypeId')
                .populate('userloginId')
                .exec((err, data) => {
                    if (err || data == undefined || data.length == 0) return res.badRequest(Utils.jsonErr("NO_REQUIREMENTS_FOUND"));
                    else res.ok('USER_DATA', data);
                })

        }
        catch (e) {
            res.badRequest(Utils.jsonErr("UNDEFINED_ERROR"));
        }

    },

    getRequirement: async function (req, res) {
        if (req.method != 'GET') {
            res.badRequest(Utils.jsonErr("NOT_FOUND"));
        }
        if (!req.query || Object.keys(req.query).length == 0) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        try {
            let fetchArray = [
                'id',
                'userloginId',
                'projectTitle',
                'quantityNeeded',
                'targetPrice',
                'activeStep',
                'requirementStatus'
            ],
                whereCondition = {
                    id: req.query.id,
                    userloginId: req.user.id
                };

            Requirements.findOne((req.user.is_admin) ? {
                select: [...fetchArray, 'isActive'],
                where: whereCondition
            } : {
                select: fetchArray
                , where: { ...whereCondition, isActive: true }
            })
                .populate('sourcingtypeId')
                .exec((err, data) => {
                    if (data && Object.keys(data).length > 0) { res.ok('USER_DATA', data) }
                    else {
                        if (err) res.badRequest(Utils.jsonErr(err));
                        else res.badRequest(Utils.jsonErr("NO_REQUIREMENT_FOUND"));
                    }
                })

        }
        catch (e) {
            res.badRequest(Utils.jsonErr("UNDEFINED_ERROR"));
        }

    },

    create: function (req, res) {
        if (req.method != 'POST') {
            res.badRequest(Utils.jsonErr("NOT_FOUND"));
        }
        if (!req.body || Object.keys(req.body).length == 0) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        let newRequirement = {
            sourcingtypeId: req.body.sourcingtypeId,
            userloginId: req.user.id,
            projectTitle: req.body.projectTitle,
            quantityNeeded: req.body.quantityNeeded,
            targetPrice: req.body.targetPrice,
            productBrief: req.body.productBrief,
            additionalRequirements: req.body.additionalRequirements,
            isActive: true,
            activeStep: req.body.activeStep,
            requirementStatus: req.body.requirementStatus
        }

        if (isNaN(newRequirement.quantityNeeded) || isNaN(newRequirement.targetPrice)) {
            return res.badRequest(Utils.jsonErr('ONLY_NUMBERS_ALLOWED_IN_QUANTITYNEEDED_AND_TARGETPRICE_FIELD'));
        }

        if (newRequirement.targetPrice.indexOf(".") == -1) {
            return res.badRequest(Utils.jsonErr('DECIMAL_POINT_IS_A_MUST_FOR_TARGETPRICE_FIELD'));
        }

        try {
            Requirements
                .create(newRequirement).exec((err, data) => {
                    if (err) return res.badRequest(err);
                    res.ok('REQUIREMENT_CREATED_SUCCESSFULLY')
                });
        }
        catch (e) {
            res.badRequest(Utils.jsonErr("UNDEFINED_ERROR"));
        }

    },

    update: async function (req, res) {
        if (req.method != 'PUT') {
            res.badRequest(Utils.jsonErr("NOT_FOUND"));
        }
        if (!req.body || Object.keys(req.body).length == 0) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        const check = await Requirements.findOne({ id: req.query.id });
        if (check == undefined || check.isActive == false || check.userloginId != req.user.id) return res.badRequest(Utils.jsonErr('NO_REQUIREMENT_FOUND'));

        let newRequirement = {
            sourcingtypeId: req.body.sourcingtypeId,
            projectTitle: req.body.projectTitle,
            quantityNeeded: req.body.quantityNeeded,
            targetPrice: req.body.targetPrice,
            productBrief: req.body.productBrief,
            additionalRequirements: req.body.additionalRequirements,
            isActive: req.body.isActive,
            activeStep: req.body.activeStep,
            requirementStatus: req.body.requirementStatus
        }

        if (isNaN(newRequirement.quantityNeeded) || isNaN(newRequirement.targetPrice)) {
            return res.badRequest(Utils.jsonErr('ONLY_NUMBERS_ALLOWED_IN_QUANTITYNEEDED_AND_TARGETPRICE_FIELD'));
        }

        if (newRequirement.targetPrice.indexOf(".") == -1) {
            return res.badRequest(Utils.jsonErr('DECIMAL_POINT_IS_A_MUST_FOR_TARGETPRICE_FIELD'));
        }

        try {
            Requirements
                .updateOne({ id: req.query.id })
                .set(newRequirement)
                .exec((err, data) => {
                    if (err) return err;
                    if (data == undefined) return res.badRequest(Utils.jsonErr('NO_REQUIREMENT_FOUND'));

                    res.ok('REQUIREMENT_UPDATED_SUCCESSFULLY');
                })
        }
        catch (e) {
            res.badRequest(Utils.jsonErr("UNDEFINED_ERROR"));
        }

    },

    delete: async function (req, res) {
        if (req.method != 'DELETE') {
            res.badRequest(Utils.jsonErr("Not found"));
        }
        if (!req.query || Object.keys(req.query).length == 0) {
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));
        }

        const check = await Requirements.findOne({ id: req.query.id });
        if (check == undefined || check.userloginId != req.user.id || check.isactive == false) return res.badRequest(Utils.jsonErr('REQUIREMENT_NOT_FOUND'));

        try {
            Requirements
                .updateOne({ id: req.query.id })
                .set({ isActive: false })
                .exec((err, data) => {
                    if (err) return err;
                    if (data == undefined) return res.badRequest(Utils.jsonErr('NOT_FOUND'));

                    res.ok('REQUIREMENT_DELETED_SUCCESSFULLY')
                })
        }
        catch (e) {
            res.badRequest(Utils.jsonErr("UNDEFINED_ERROR"));
        }
    }

};

