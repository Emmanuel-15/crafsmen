/**
 * BookingsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    /**
     * Action for 'GET' /bookings
     * @param req
     * @param res
     * @returns {*}
     */
    getAll: async function (req, res) {
        try {
            await Bookings.find({ isActive: true })
                .exec((err, data) => {
                    if (err || data.length == 0)
                        return res.ok("NO_BOOKINGS_FOUND");
                    else
                        return res.ok("BOOKINGS", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'GET' /bookings/:id
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

        try {
            await Bookings
                .findOne({ bookingId: req.param('id'), isActive: true })
                .exec((err, data) => {
                    if (err || !data)
                        res.ok("NO_BOOKING_FOUND");
                    else
                        res.ok("BOOKINGS", data);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'POST' /bookings
     * @param req
     * @param res
     * @returns {*}
     */
    create: async function (req, res) {
        // if (req.user.isAdmin != true)
        //     return res.forbidden("NOT_ALLOWED");

        const validReq = await Utils.isValidRequest(req, false, true);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        const newBooking = {
            customerId: req.user.userId,
            contractorId: req.body.contractorId,
            serviceId: req.body.serviceId,
            bookingDateTimeFrom: req.body.bookingDateTimeFrom,
            bookingDateTimeTo: req.body.bookingDateTimeTo,
        };

        // console.log("validation: ", (new Date()).getTime(newBooking.bookingDateTimeFrom))

        const schema = {
            type: 'object',
            required: ['customerId', 'contractorId', 'serviceId', 'bookingDateTimeFrom', 'bookingDateTimeTo'],
            properties: {
                customerId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_CUSTOMER_ID'
                    }
                },
                contractorId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_CONTRACTOR_ID'
                    }
                },
                serviceId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_SERVICE_ID'
                    }
                },
                bookingDateTimeFrom: {
                    type: 'string',
                    // format: 'custom-date-time',
                    // errorMessage: {
                    //     type: 'INVALID_DATE',
                    //     format: 'INVALID_BOOKING_DATE_TIME_FROM'
                    // }
                },
                bookingDateTimeTo: {
                    type: 'string',
                    // format: 'custom-date-time',
                    // errorMessage: {
                    //     type: 'INVALID_DATE',
                    //     format: 'INVALID_BOOKING_DATE_TIME_FROM'
                    // }
                },

            }, errorMessage: {
                type: 'should be an object',
                required: {
                    customerId: 'CUSTOMER_ID_IS_MISSING',
                    contractorId: 'CONTRACTOR_ID_IS_MISSING',
                    serviceId: 'SERVICE_ID_IS_MISSING',
                    bookingDateTimeFrom: 'BOOKING_DATE_TIME_FROM_IS_MISSING',
                    bookingDateTimeTo: 'BOOKING_DATE_TIME_TO_IS_MISSING'
                }
            },
        }

        const validations = Utils.validate(schema, newBooking);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));


        try {
            // const check = await Bookings.findOne();

            // if (check)
            //     return res.forbidden(Utils.jsonErr("BOOKING_ALREADY_EXISTS"));
            await Bookings
                .create(newBooking)
                .exec((err) => {
                    console.log("I am err: ", err)
                    if (err)
                        return res.badRequest(Utils.jsonErr(err));
                    else
                        return res.created("BOOKING_CREATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'PUT' /bookings
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

        const updateBooking = {
            contractorId: req.body.contractorId,
            serviceId: req.body.serviceId,
            appointmentDate: req.body.appointmentDate,
            appointmentTime: req.body.appointmentTime,
            servicePrice: req.body.servicePrice,
            paymentStatus: false,
        };


        try {
            const idExists = await Bookings.findOne({ bookingId: id, isActive: true });

            if (!idExists)
                return res.badRequest(Utils.jsonErr("NO_BOOKING_FOUND"));

            await Bookings.updateOne({ bookingId: id }).set(updateBooking)
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_UPDATING_BOOKING"));
                    else
                        return res.ok("BOOKING_UPDATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'DELETE' /bookings
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
            const check = await Bookings.findOne({ bookingId: req.param('id'), isActive: true });

            if (!check)
                return res.badRequest(Utils.jsonErr("BOOKING_NOT_FOUND"));

            ServiceType.updateOne({ serviceTypeId: req.param('id') }).set({ isActive: false })
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_BOOKING"));

                    res.ok("BOOKING_DELTED");
                });
        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};

