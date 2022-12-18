/**
 * ServicesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    getAll: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();


        try {
            await Car_category.find()
                .exec((err, data) => {
                    if (err || data.length == 0)
                        return res.ok("NO_CATEGORIES_FOUND");
                    else
                        return res.ok("CAR_CATEGORIES", data);
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


        if (!_.isNumber(req.param('id')))
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        try {
            await Car_category
                .findOne({ carCategoryId: req.param('id') })
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


        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));

        const newCarCategory = {
            carCategoryName: req.body.carCategoryName,
            carCategorySlug: req.body.carCategorySlug
        };

        const validate = ajv.compile(schema);
        const valid = validate(newCarCategory);

        if (!valid) {
            let errors = [];

            validate.errors.forEach((data) => {
                errors.push(data.message);
            })
            return res.badRequest(Utils.jsonErr(errors));
        }


        const check = await Car_category.findOne({ carCategoryName: newCarCategory.carCategoryName });

        if (check)
            return res.forbidden(Utils.jsonErr("CAR_CATEGORY_ALREADY_EXISTS"));    //use 403 status code. for already existing 


        try {
            await Car_category
                .create(newCarCategory)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr(err));
                    else
                        return res.created("CAR_CATEGORY_CREATED");
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
        const updateCarCategory = {
            carCategoryName: req.body.carCategoryName,
            carCategorySlug: req.body.carCategorySlug
        };


        if (!_.isNumber(id))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        // if (!_.isNumber(updateCarCategory.carCategoryName) || !_.isNumber(updateCarCategory.carCategorySlug)) //lodsh vall..
        // return res.badRequest(Utils.jsonErr("INVALID_carCategoryName_OR_SLUG"));


        const idExists = await Car_category.findOne({ carCategoryId: id });

        if (!idExists)
            return res.badRequest(Utils.jsonErr("NO_CAR_CATEGORY"));


        const categoryNameExists = await Car_category.findOne({ carCategoryName: updateCarCategory.carCategoryName });

        if (categoryNameExists)
            return res.badRequest(Utils.jsonErr("CAR_CATEGORY_ALREADY_EXISTS"));


        try {
            await Car_category.updateOne({ carCategoryId: id }).set(updateCarCategory)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_CAR_CATEGORY"));
                    else
                        return res.ok("CAR_CATEGORY_UPDATED");
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


        if (!_.isNumber(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        const check = await Car_category.findOne({ carCategoryId: req.param('id') });

        if (!check)
            return res.badRequest(Utils.jsonErr("CAR_CATEGORY_NOT_FOUND"));


        try {
            Car_category.destroy({ carCategoryId: req.param('id') })
                .exec((err) => {
                    if (err) {

                        if (err.raw && err.raw.code && err.raw.code === '23503')
                            return res.badRequest(Utils.jsonErr("CAR_CATEGORY_ALREADY_IN_USE"));
                        else
                            return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_CAR_CATEGORY"));
                    }

                    res.ok("CAR_CATEGORY_DELTED");
                })
        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    }

};

