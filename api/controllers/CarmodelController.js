/**
 * CarmodelController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const API_ERRORS = require("../constants/APIErrors");

module.exports = {

    getAll: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();


        const check = await Car_model.find();

        if (!check)
            return res.badRequest(Utils.jsonErr("NO_CAR_MODELS_FOUND"));


        //The following query uses foreign key constraint to join tables.
        const query = `SELECT car_model_id AS "CarModelId",
                    car_category.car_category_id AS "carCategoryId",
                    car_category.car_category_name AS "carCategoryName",
                    car_model_name AS "carModelName",
                    car_model_slug AS "carModelSlug",
                    security_deposit_amt AS "securityDepositAmt",
                    is_active AS "isActive",
                    model_image AS "modelImage",
                    car_model.created_date AS "modelCreatedDate",
                    car_model.modified_date AS "modelModifiedDate"
                    FROM car_model, car_category
                    WHERE  car_category.car_category_id = car_model.car_category_id 
                    AND is_active = true
                    ORDER BY car_model.car_model_name ASC, car_category.car_category_id ASC
                    LIMIT 15`;

        try {
            await Car_model.getDatastore().sendNativeQuery(query, function (err, data) {
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_CAR_MODELS"));
                else {
                    CarModelManager
                        .group(data.rows)
                        .then(data => {
                            res.ok("CAR_MODELS", data);
                        });
                }
            })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    },


    get: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("EMPTY_PARAM"));


        if (!_.isNumber(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        try {
            await Car_model
                .findOne({ carModelId: req.param('id'), isActive: true })
                .exec((err, data) => {
                    if (err || !data)
                        res.ok("NO_CAR_MODEL_FOUND");
                    else
                        res.ok("CAR_MODELS", data);
                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    },


    create: async function (req, res) {
        if (req.method !== 'POST')
            return res.notFound();


        if (!req.body || _.keys(req.body).length == 0)
            return res.badRequest(Utils.jsonErr("EMPTY_BODY"));


        const newCarModel = {
            carCategoryId: req.body.carCategoryId,
            carModelName: req.body.carModelName,
            carModelSlug: req.body.carModelSlug,
            securityDepositAmt: req.body.securityDepositAmt,
            isActive: true,
            modelImage: ''
        }

        if (!_.isNumber(newCarModel.carCategoryId) || !_.isNumber(newCarModel.securityDepositAmt))
            return res.badRequest(Utils.jsonErr("INVALID_CAR_CATEGORY_ID_OR_SECURITY_DEPOSIT"));


        CarModelManager
            .createCarModel(req, newCarModel)
            .then(() => {
                return res.created("CAR_MODEL_CREATED_SUCCESSFULLY");

            })
            .catch(err => {
                switch (err) {
                    case API_ERRORS.NOT_ALLOWED:
                        return res.badRequest(Utils.jsonErr("ONLY_JPEG_&_PNG_FILES_ALLOWED"));

                    case API_ERRORS.LARGE_FILE:
                        return res.badRequest(Utils.jsonErr("MAX_FILE_SIZE_10MB!"));

                    case API_ERRORS.EXCEPTION:
                        return res.serverError(Utils.jsonErr("EXCEPTION"));

                    default:
                        return res.badRequest(Utils.jsonErr("ERROR_CREATING_CAR_MODEL"));

                }
            })

    },


    update: async function (req, res) {
        if (req.method !== 'PUT')
            return res.notFound();


        if (!req.body || _.isEmpty(req.body))
            return res.badRequest(Utils.jsonErr("EMPTY_BODY"));


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("NO_PARAMS_FOUND"));


        const updateCarModel = {
            carCategoryId: req.body.carCategoryId,
            carModelName: req.body.carModelName,
            carModelSlug: req.body.carModelSlug,
            securityDepositAmt: req.body.securityDepositAmt,
            modelImage: ''
        }

        if (!_.isNumber(updateCarModel.carCategoryId) || !_.isNumber(updateCarModel.securityDepositAmt))
            return res.badRequest(Utils.jsonErr("INVALID_carCategoryId_OR_SECURITY_DEPOSIT"));


        const check = await Car_model.findOne({ carModelId: req.param("id"), isActive: true })

        if (!check)
            return res.badRequest(Utils.jsonErr('NO_CAR_MODEL_FOUND_TO_BE_UPDATED'));

        CarModelManager
            .updateModel(req, updateCarModel)
            .then(() => {
                return res.ok("CAR_MODEL_UPDATED_SUCCESSFULLY");

            })
            .catch(err => {
                if (err.code == "E_EXCEEDS_UPLOAD_LIMIT")
                    return res.badRequest(Utils.jsonErr("UPLOAD_LIMIT_10MB"));

                return res.badRequest(Utils.jsonErr("ERROR_WHILE_UPDATING_CAR_MODEL"));

            })

    },


    delete: async function (req, res) {
        if (req.method !== 'DELETE')
            return res.notFound();


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("EMPTY_PARAM"));


        if (!_.isNumber(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        const check = await Car_model.findOne({ carModelId: req.param('id'), isActive: true });

        if (!check)
            return res.badRequest(Utils.jsonErr("NO_CAR_MODEL_FOUND_TO_BE_DELETED"));


        try {
            await Car_model.updateOne({ carModelId: req.param('id') })
                .set({ isActive: false })
                .then(() => {
                    res.ok("CAR_MODEL_DELETED_SUCCESSFULLY");

                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }

};

