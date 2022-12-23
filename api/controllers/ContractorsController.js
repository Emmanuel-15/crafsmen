/**
 * ContractorsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


function doesNameExist(name) {

    return Contractors.findOne({ contractorName: name })

}

function doesNumberExist(number, col) {

    let obj;

    if (col)
        obj = { contactNumber1: number }
    else
        obj = { contactNumber2: number }

    return Contractors.findOne(obj)

}

function doesEmailExist(email) {

    return Contractors.findOne({ contractorEmail: email })
}

module.exports = {

    getAll: async function (req, res) {
        if (req.method !== 'GET')
            return res.notFound();


        try {
            await Contractors.find({ isActive: true })
                .exec((err, data) => {
                    if (err || data.length == 0)
                        return res.ok("NO_CONTRACTORS_FOUND");
                    else
                        return res.ok("CONTRACTORS", data);
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
            await Contractors
                .findOne({ contractorId: req.param('id'), isActive: true })
                .exec((err, data) => {
                    if (err || !data)
                        res.ok("NO_CONTRACTOR_FOUND");
                    else
                        res.ok("CONTRACTOR", data);
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


        const newContractor = {
            contractorName: req.body.contractorName,
            contractorAddress: req.body.contractorAddress,
            contactNumber1: req.body.contactNumber1,
            contactNumber2: req.body.contactNumber2,
            contractorEmail: req.body.contractorEmail,
            isActive: true,
        };

        if (newContractor.contactNumber2 && newContractor.contactNumber1 == newContractor.contactNumber2)
            return res.badRequest(Utils.jsonErr("PROVIDE_DIFFERENT_NUMBERS"));


        if (await doesNameExist(newContractor.contractorName))
            return res.forbidden(Utils.jsonErr("NAME_ALREADY_IN_USE"));

        if (await doesNumberExist(newContractor.contactNumber1, 1) || await doesNumberExist(newContractor.contactNumber2))
            return res.forbidden(Utils.jsonErr("NUMBER_ALREADY_IN_USE"));

        if (await doesEmailExist(newContractor.contractorEmail))
            return res.forbidden(Utils.jsonErr("EMAIL_ALREADY_IN_USE"));

        try {
            await Contractors
                .create(newContractor)
                .exec((err) => {
                    if (err)
                        return res.badRequest("ERROR_WHILE_CREATING_CONTRACTOR");
                    else
                        return res.created("CONTRACTOR_CREATED");
                })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

        // doesNameExist(newContractor.contractorName)
        //     .then(async exists => {
        //         if (exists)
        //             return res.forbidden(Utils.jsonErr("NAME_ALREADY_IN_USE"));    //use 403 status code. for already existing 

        //         doesNumberExist(newContractor.contactNumber1, 1)
        //             .then(async exists => {
        //                 if (exists)
        //                     return res.forbidden(Utils.jsonErr("NUMBER_ALREADY_IN_USE"));

        //                 doesEmailExist(newContractor.contractorEmail, 1)
        //                     .then(async exists => {
        //                         if (exists)
        //                             return res.forbidden(Utils.jsonErr("EMAIL_ALREADY_IN_USE"));

        //                         try {
        //                             await Contractors
        //                                 .create(newContractor)
        //                                 .exec((err, data) => {
        //                                     if (err)
        //                                         return res.badRequest("ERROR_WHILE_CREATING_CONTRACTOR");
        //                                     else
        //                                         return res.created("CONTRACTOR_CREATED");
        //                                 })

        //                         } catch (err) {
        //                             return res.serverError(Utils.jsonErr("EXCEPTION"));
        //                         }

        //                     })

        //             })

        //     })
    },


    update: async function (req, res) {
        if (req.method !== 'PUT')
            return res.notFound();


        if (!req.body || _.keys(req.body).length == 0)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        if (!req.param || req.param.length != 2)
            return res.badRequest(Utils.jsonErr("BAD_REQUEST"));


        const id = req.param("id");

        const updateContractor = {
            contractorName: req.body.contractorName,
            contractorAddress: req.body.contractorAddress,
            contactNumber1: req.body.contactNumber1,
            contactNumber2: req.body.contactNumber2,
            contractorEmail: req.body.contractorEmail,
        };


        if (isNaN(id))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));


        const idExists = await Contractors.findOne({ contractorId: id, isActive: true });

        if (!idExists)
            return res.badRequest(Utils.jsonErr("NO_CONTRACTOR_FOUND"));


        if (updateContractor.contactNumber2 && updateContractor.contactNumber1 == updateContractor.contactNumber2)
            return res.badRequest(Utils.jsonErr("PROVIDE_DIFFERENT_NUMBERS"));


        if (await doesNameExist(updateContractor.contractorName))
            return res.forbidden(Utils.jsonErr("NAME_ALREADY_IN_USE"));

        if (await doesNumberExist(updateContractor.contactNumber1, 1) || await doesNumberExist(updateContractor.contactNumber2))
            return res.forbidden(Utils.jsonErr("NUMBER_ALREADY_IN_USE"));

        if (await doesEmailExist(updateContractor.contractorEmail))
            return res.forbidden(Utils.jsonErr("EMAIL_ALREADY_IN_USE"));


        try {
            await Contractors.updateOne({ contractorId: id }).set(updateContractor)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_CONTRACTOR"));
                    else
                        return res.ok("CONTRACTOR_UPDATED");
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


        const check = await Contractors.findOne({ contractorId: req.param('id'), isActive: true });

        if (!check)
            return res.badRequest(Utils.jsonErr("CONTRACTOR_NOT_FOUND"));


        try {

            Contractors.updateOne({ contractorId: req.param('id') })
                .set({ isActive: false })
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_CONTRACTOR"));
                    else
                        res.ok("CONTRACTOR_DELTED");

                })

        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }

    }

};

