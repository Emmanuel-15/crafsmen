/**
 * CarController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const API_ERRORS = require("../constants/APIErrors");
const test = require("../helpers/test");
const CarManager = require("../services/CarManager");
const universalManager = require("../services/universalManager");
const Utils = require("../services/Utils");


module.exports = {

    getAll: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();


        try {
            await Car
                .find({ isActive: true })
                .exec((err, data) => {
                    if (err || data.length == 0)
                        return res.ok("NO_CARS_FOUND");
                    else
                        return res.ok("CARS", data);
                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },


    get: async function (req, res) {
        // const valid = await universalManager
        //     .isValidRequest(req, res, 'GET', true, false)
        //     .catch(err => {
        //         console.log("I am in catch block", err)
        //         switch (err) {
        //             case API_ERRORS.NOT_ALLOWED:
        //                 return res.badRequest(Utils.jsonErr("ONLY_JPEG_&_PNG_FILES_ALLOWED"));
        //             default:
        //                 return res.badRequest(Utils.jsonErr("ERROR_CREATING_CAR"));
        //         }
        //     })

        if (req.method !== 'GET')
            return res.notFound();


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        if (!_.isNumber(req.param('id')))
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        try {
            await Car
                .findOne({ carId: req.param('id'), isActive: true })
                .exec((err, data) => {
                    if (err || !data)
                        res.ok("NO_CARS_FOUND");
                    else
                        res.ok("CAR", data);
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

        const newCar = {
            carModelId: req.body.carModelId,
            carRegistrationNumber: req.body.carRegistrationNumber,
            carDescription: req.body.carDescription,
            carImage: '',
            carCapacity: req.body.carCapacity,
            heavyLuggage: req.body.heavyLuggage,
            lightLuggage: req.body.lightLuggage,
            fuelType: req.body.fuelType,
            musicSystem: req.body.musicSystem,
            airConditioning: req.body.airConditioning,
            isTrash: false,
            isActive: true,
            isDeleted: false,
            cdwInsurance: req.body.cdwInsurance,
            cdwInsuranceAmt: req.body.cdwInsuranceAmt,
            hasAirbags: req.body.hasAirbags,
            tubelessTyres: req.body.tubelessTyres,
            hasGps: req.body.hasGps,
            hasSunroof: req.body.hasSunroof,
            carPaintColor: req.body.carPaintColor,
            isAutomatic: req.body.isAutomatic,
            electricKmRange: req.body.electricKmRange
        };

        if (!_.isNumber(newCar.carCapacity) || !_.isNumber(newCar.heavyLuggage) || !_.isNumber(newCar.lightLuggage) || !_.isNumber(newCar.fuelType))
            return res.badRequest(Utils.jsonErr("INVALID_INPUT"));


        if (newCar.cdwInsurance == true && !_.isNumber(newCar.cdwInsuranceAmt))
            return res.badRequest(Utils.jsonErr("INVALID_CWD_INSURANCE_AMT"));


        if (newCar.fuelType != 4 && newCar.electricKmRange)
            return res.badRequest(Utils.jsonErr("electricKmRange_IS_REQUIRED_ONLY_FOR_ELECTRIC_CARS"));


        if (newCar.fuelType == 4 && !newCar.electricKmRange)
            return res.badRequest(Utils.jsonErr("electricKmRange_IS_REQUIRED_FOR_ELECTRIC_CARS"));


        const check = await Car.findOne({ carRegistrationNumber: newCar.carRegistrationNumber, isActive: true });

        if (check)
            return res.forbidden(Utils.jsonErr("CAR_REG_NO_ALREADY_EXISTS"));


        CarManager
            .createCar(req, newCar)
            .then(() => {
                return res.created("CAR_CREATED");

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
                        return res.badRequest(Utils.jsonErr("ERROR_CREATING_CAR"));
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


        const id = req.param('id');

        const updateCar = {
            carModelId: req.body.carModelId,
            carRegistrationNumber: req.body.carRegistrationNumber,
            carDescription: req.body.carDescription,
            carImage: '',
            carCapacity: req.body.carCapacity,
            heavyLuggage: req.body.heavyLuggage,
            lightLuggage: req.body.lightLuggage,
            fuelType: req.body.fuelType,
            musicSystem: req.body.musicSystem,
            airConditioning: req.body.airConditioning,
            cdwInsurance: req.body.cdwInsurance,
            cdwInsuranceAmt: req.body.cdwInsuranceAmt,
            hasAirbags: req.body.hasAirbags,
            tubelessTyres: req.body.tubelessTyres,
            hasGps: req.body.hasGps,
            hasSunroof: req.body.hasSunroof,
            carPaintColor: req.body.carPaintColor,
            isAutomatic: req.body.isAutomatic,
            electricKmRange: req.body.electricKmRange
        };

        if (!_.isNumber(id))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        if (!_.isNumber(updateCar.carCapacity) || !_.isNumber(updateCar.heavyLuggage) || !_.isNumber(updateCar.lightLuggage) || !_.isNumber(updateCar.fuelType))
            return res.badRequest(Utils.jsonErr("INVALID_INPUT"));


        if (updateCar.cdwInsurance == true && !_.isNumber(updateCar.cdwInsuranceAmt))
            return res.badRequest(Utils.jsonErr("INVALID_CWD_INSURANCE_AMT"));


        if (updateCar.fuelType != 4 && updateCar.electricKmRange)
            return res.badRequest(Utils.jsonErr("electricKmRange_IS_REQUIRED_ONLY_FOR_ELECTRIC_CARS"));


        if (updateCar.fuelType == 4 && !updateCar.electricKmRange)
            return res.badRequest(Utils.jsonErr("electricKmRange_IS_REQUIRED_FOR_ELECTRIC_CARS"));


        const carExists = await Car.findOne({ carId: id, isActive: true });

        if (!carExists)
            return res.badRequest(Utils.jsonErr("NO_CAR"));


        const check = await Car.findOne({ carRegistrationNumber: updateCar.carRegistrationNumber });

        if (check && check.carId != id)
            return res.badRequest(Utils.jsonErr("CAR_REG_NO_ALREADY_EXISTS"));


        try {
            await Car.updateOne({ carId: id }).set(updateCar)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_CAR"));
                    else
                        return res.ok("CAR_UPDATED");
                })
        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    delete: async function (req, res) {
        if (req.method !== 'DELETE')
            return res.notFound();


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("EMPTY_PARAM"));


        if (!_.isNumber(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        const check = await Car.findOne({ carId: req.param('id'), isActive: true });

        if (!check)
            return res.badRequest(Utils.jsonErr("NO_CAR_FOUND_TO_BE_DELETED"));


        try {
            await Car.updateOne({ carId: req.param('id') })
                .set({ isActive: false })
                .then(() => {
                    res.ok("CAR_DELETED_SUCCESSFULLY");

                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};

