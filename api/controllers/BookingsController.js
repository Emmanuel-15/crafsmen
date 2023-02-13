/**
 * BookingsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require("moment");
const Utils = require("../services/Utils");
var Sails = require('sails');

module.exports = {

    /**
     * Action for 'GET' /bookings
     * @param req
     * @param res
     * @returns {*}
     */
    getAll: async function (req, res) {
        if (req.user.isAdmin != true)
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));
        // const pageNo = (req.query.page) ? ((req.query.page) * 10) : 0;

        const query = `SELECT booking_id AS "bookingId",
                        UserLogin.user_name AS "userName",
                        Contractors.contractor_name AS "contractorName",
                        Services.service_title AS "serviceTitle",
                        booking_date_time_from AS "bookingDateTimeFrom",
                        booking_date_time_to AS "bookingDateTimeTo",
                        ServicePrice.discount_price AS "discountPrice",
                        ServicePrice.unit_price AS "unitPrice",
                        booking_status AS "bookingStatus",
                        Bookings.created_date AS "createdDate"
                        FROM Bookings, UserLogin, Contractors, Services, ServicePrice
                        WHERE Bookings.user_id = UserLogin.user_id
                        AND Bookings.contractor_id = Contractors.contractor_id
                        AND Bookings.service_id = Services.service_id
                        AND Bookings.service_price_id = ServicePrice.service_price_id
                        AND Bookings.is_active = true
                        ORDER BY Bookings.booking_date_time_from ASC`;

        try {
            await Bookings.getDatastore().sendNativeQuery(query, function (err, data) {
                console.log(data)
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_BOOKINGS"));
                else if (!data || data.rows.length == 0)
                    return res.ok("NO_BOOKINGS_FOUND", data.rows);
                else
                    return res.ok("BOOKINGS", data.rows);
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

        const query = `SELECT booking_id AS "bookingId",
            UserLogin.user_name AS "userName",
            Contractors.contractor_name AS "contractorName",
            Services.service_title AS "serviceTitle",
            booking_date_time_from AS "bookingDateTimeFrom",
            booking_date_time_to AS "bookingDateTimeTo",
            ServicePrice.discount_price AS "discountPrice",
            ServicePrice.unit_price AS "unitPrice",
            booking_status AS "bookingStatus",
            Bookings.created_date AS "createdDate"
            FROM Bookings, UserLogin, Contractors, Services, ServicePrice
            WHERE Bookings.user_id = UserLogin.user_id
            AND Bookings.contractor_id = Contractors.contractor_id
            AND Bookings.service_id = Services.service_id
            AND Bookings.service_price_id = ServicePrice.service_price_id
            AND Bookings.is_active = true
            AND Bookings.booking_id = $1`;

        try {
            await Bookings.getDatastore().sendNativeQuery(query, [req.param('id')], function (err, data) {
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_BOOKINGS"));
                else if (!data || data.rows.length == 0)
                    return res.ok("NO_BOOKINGS_FOUND", data.rows);
                else
                    return res.ok("BOOKINGS", data.rows);
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
        const validReq = await Utils.isValidRequest(req, false, true);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        const newBooking = {
            userId: req.user.userId,
            contractorId: req.body.contractorId,
            serviceId: req.body.serviceId,
            bookingDateTimeFrom: req.body.bookingDateTimeFrom,
            bookingDateTimeTo: req.body.bookingDateTimeTo,
            servicePriceId: req.body.servicePriceId,
            bookingStatus: "PENDING"
        };

        if (new Date(newBooking.bookingDateTimeTo) < new Date(newBooking.bookingDateTimeFrom))
            return res.badRequest(Utils.jsonErr("INCORRECT_BOOKING_DATE_TIME_TO"));

        const schema = {
            type: 'object',
            required: ['userId', 'contractorId', 'serviceId', 'bookingDateTimeFrom', 'bookingDateTimeTo', 'servicePriceId'],
            properties: {
                userId: {
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
                    format: 'date-time',
                    errorMessage: {
                        type: 'INVALID_DATE',
                        format: 'INVALID_BOOKING_DATE_TIME_FROM'
                    }
                },
                bookingDateTimeTo: {
                    type: 'string',
                    format: 'date-time',
                    errorMessage: {
                        type: 'INVALID_DATE',
                        format: 'INVALID_BOOKING_DATE_TIME_TO'
                    }
                },
                servicePriceId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_SERVICE_PRICE_ID'
                    }
                }

            }, errorMessage: {
                required: {
                    customerId: 'CUSTOMER_ID_IS_REQUIRED',
                    contractorId: 'CONTRACTOR_ID_IS_REQUIRED',
                    serviceId: 'SERVICE_ID_IS_REQUIRED',
                    bookingDateTimeFrom: 'BOOKING_DATE_TIME_FROM_IS_REQUIRED',
                    bookingDateTimeTo: 'BOOKING_DATE_TIME_TO_IS_REQUIRED',
                    servicePriceId: 'SERVICE_PRICE_ID_IS_REQUIRED'
                }
            }
        };

        const validations = Utils.validate(schema, newBooking);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            const contractorNotAvailable = await Bookings.find({
                contractorId: req.body.contractorId,
                isActive: true,
                bookingDateTimeTo: { '>=': req.body.bookingDateTimeFrom }
            }).limit(1);

            if (contractorNotAvailable.length !== 0)
                return res.badRequest(Utils.jsonErr("CONTRACTOR_NOT_AVAILABLE"));

            await Bookings
                .create(newBooking)
                .exec((err) => {
                    if (err) {
                        if (err.raw && err.raw.code && err.raw.code === '23503' && err.raw.constraint == 'contractors_contractorId_fkey')
                            return res.badRequest(Utils.jsonErr("CONTRACTOR_ID_DOES_NOT_EXIST"));

                        else if (err.raw && err.raw.code && err.raw.code === '23503' && err.raw.constraint == 'services_serviceId_fkey')
                            return res.badRequest(Utils.jsonErr("SERVICE_ID_DOES_NOT_EXIST"));

                        else if (err.raw && err.raw.code && err.raw.code === '23503' && err.raw.constraint == 'servicePrice_servicePriceId_fkey')
                            return res.badRequest(Utils.jsonErr("SERVICE_PRICE_ID_DOES_NOT_EXIST"));

                        else
                            return res.badRequest(Utils.jsonErr("ERROR_WHILE_CREATING_BOOKING"));
                    }
                    else
                        return res.created("BOOKING_CREATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'PUT' /bookings/:id
     * @param req
     * @param res
     * @returns {*}
     */
    update: async function (req, res) {
        if (req.user.isAdmin != true)
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

        const validReq = await Utils.isValidRequest(req, true, true);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        const id = req.param("id");
        if (isNaN(id))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        const updateBooking = {
            contractorId: req.body.contractorId,
            serviceId: req.body.serviceId,
            bookingDateTimeFrom: req.body.bookingDateTimeFrom,
            bookingDateTimeTo: req.body.bookingDateTimeTo,
            servicePriceId: req.body.servicePriceId,
            bookingStatus: req.body.bookingStatus
        };

        if (updateBooking.bookingDateTimeFrom && !updateBooking.bookingDateTimeTo)
            return res.badRequest(Utils.jsonErr("BOOKING_DATE_TIME_TO_IS_REQUIRED"));

        if (updateBooking.bookingDateTimeTo && !updateBooking.bookingDateTimeFrom)
            return res.badRequest(Utils.jsonErr("BOOKING_DATE_TIME_FROM_IS_REQUIRED"));

        const schema = {
            type: 'object',
            properties: {
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
                    format: 'date-time',
                    errorMessage: {
                        type: 'INVALID_DATE',
                        format: 'INVALID_BOOKING_DATE_TIME_FROM'
                    }
                },
                bookingDateTimeTo: {
                    type: 'string',
                    format: 'date-time',
                    errorMessage: {
                        type: 'INVALID_DATE',
                        format: 'INVALID_BOOKING_DATE_TIME_TO'
                    }
                },
                servicePriceId: {
                    type: 'number',
                    errorMessage: {
                        type: 'INVALID_SERVICE_PRICE_ID'
                    }
                },
                bookingStatus: {
                    type: 'string',
                    errorMessage: {
                        type: 'INVALID_BOOKING_STATUS'
                    }
                }
            }
        };

        const validations = Utils.validate(schema, updateBooking);

        if (validations)
            return res.badRequest(Utils.jsonErr(validations));

        try {
            const idExists = await Bookings.findOne({ bookingId: id, isActive: true });

            if (!idExists)
                return res.badRequest(Utils.jsonErr("NO_BOOKING_FOUND"));

            // logic to check if contractor is availble or not.

            // if (updateBooking.bookingDateTimeFrom && updateBooking.bookingDateTimeTo) {
            //     const contractorNotAvailable = await Bookings.find({
            //         bookingId: { '!=': id },
            //         contractorId: req.body.contractorId,
            //         isActive: true,
            //         bookingDateTimeTo: { '>=': req.body.bookingDateTimeFrom }
            //     }).limit(1);

            //     if (contractorNotAvailable.length !== 0)
            //         return res.badRequest(Utils.jsonErr("CONTRACTOR_NOT_AVAILABLE"));
            // }

            await Bookings.updateOne({ bookingId: id }).set(updateBooking)
                .exec((err) => {
                    if (err) {
                        if (err.raw && err.raw.code && err.raw.code === '23503' && err.raw.constraint == 'contractors_contractorId_fkey')
                            return res.badRequest(Utils.jsonErr("CONTRACTOR_ID_DOES_NOT_EXIST"));

                        else if (err.raw && err.raw.code && err.raw.code === '23503' && err.raw.constraint == 'services_serviceId_fkey')
                            return res.badRequest(Utils.jsonErr("SERVICE_ID_DOES_NOT_EXIST"));

                        else if (err.raw && err.raw.code && err.raw.code === '23503' && err.raw.constraint == 'servicePrice_servicePriceId_fkey')
                            return res.badRequest(Utils.jsonErr("SERVICE_PRICE_ID_DOES_NOT_EXIST"));

                        else
                            return res.badRequest(Utils.jsonErr("ERROR_UPDATING_BOOKING"));
                    }
                    else
                        return res.ok("BOOKING_UPDATED");
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    /**
     * Action for 'DELETE' /bookings/:id
     * @param req
     * @param res
     * @returns {*}
     */
    delete: async function (req, res) {
        if (req.user.isAdmin != true)
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

        const validReq = await Utils.isValidRequest(req, true, false);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        try {
            const check = await Bookings.findOne({ bookingId: req.param('id'), isActive: true });

            if (!check)
                return res.badRequest(Utils.jsonErr("BOOKING_NOT_FOUND"));

            Bookings.updateOne({ BookingId: req.param('id') }).set({ isActive: false })
                .exec((err) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_DELETING_BOOKING"));

                    res.ok("BOOKING_DELTED");
                });
        }
        catch (e) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    customerBookings: async function (req, res) {
        const query = `SELECT booking_id AS "bookingId",
                        UserLogin.user_name AS "userName",
                        Contractors.contractor_name AS "contractorName",
                        Services.service_title AS "serviceTitle",
                        booking_date_time_from AS "bookingDateTimeFrom",
                        booking_date_time_to AS "bookingDateTimeTo",
                        ServicePrice.discount_price AS "discountPrice",
                        ServicePrice.unit_price AS "unitPrice",
                        booking_status AS "bookingStatus",
                        Bookings.created_date AS "createdDate"
                        FROM Bookings, UserLogin, Contractors, Services, ServicePrice
                        WHERE Bookings.user_id = UserLogin.user_id
                        AND Bookings.contractor_id = Contractors.contractor_id
                        AND Bookings.service_id = Services.service_id
                        AND Bookings.service_price_id = ServicePrice.service_price_id
                        AND Bookings.is_active = true
                        AND Bookings.user_id = $1
                        ORDER BY Bookings.booking_date_time_from ASC`;

        try {
            await Bookings.getDatastore().sendNativeQuery(query, [req.user.userId], function (err, data) {
                if (err)
                    return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_CUSTOMER_BOOKINGS"));
                else if (data.rows.length == 0)
                    return res.badRequest(Utils.jsonErr("NO_BOOKINGS_FOUND"));
                else
                    return res.ok("BOOKINGS", data.rows);
            })

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    cancelBookings: async function (req, res) {
        const validReq = await Utils.isValidRequest(req, true, false);

        if (validReq)
            return res.badRequest(Utils.jsonErr(validReq));

        if (isNaN(req.param('id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        try {
            const check = await Bookings.findOne({ bookingId: req.param('id'), isActive: true, bookingStatus: "CANCEL" });

            if (check)
                return res.badRequest(Utils.jsonErr("BOOKING_ALREADY_CANCELLED"));

            Bookings.updateOne({ bookingId: req.param('id') }).set({ bookingStatus: "CANCEL" })
                .exec((err) => {
                    console.log(err)
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_CANCELLING_BOOKING"));

                    res.ok("BOOKING_CANCELLED");
                });
        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    },

    dashboardCount: async function (req, res) {
        if (req.user.isAdmin != true)
            return res.forbidden(Utils.jsonErr("NOT_ALLOWED"));

        let today = moment(new Date()).format("YYYY-MM-DD");

        let query = `select 
         (select count(*) from Userlogin where is_admin = false) as customerCount,
         (select count(*) from Contractors) as contractorCount,
         (select count(*) from Services) as serviceCount,
         (select count(*) from Bookings where created_date >= '${today}') as bookingCount`;

        try {
            await Sails.sendNativeQuery(query)
                .exec((err, data) => {
                    if (err)
                        return res.badRequest(Utils.jsonErr("ERROR_WHILE_FETCHING_RECORDS"));
                    else
                        return res.ok("BOOKINGS", data.rows);
                });

        } catch (err) {
            return res.serverError(Utils.jsonErr("EXCEPTION"));
        }
    }
};