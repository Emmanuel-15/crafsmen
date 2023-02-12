/**
 * Bookings.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  primaryKey: 'bookingId',

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    createdAt: false,
    updatedAt: false,
    id: false,

    bookingId: {
      type: 'number',
      autoIncrement: true,
      columnName: 'booking_id'
    },

    userId: {
      type: 'ref',
      columnType: 'int',
      columnName: 'user_id'
    },

    contractorId: {
      type: 'ref',
      columnType: 'int',
      columnName: 'contractor_id'
    },

    serviceId: {
      type: 'ref',
      columnType: 'int',
      columnName: 'service_id'
    },

    bookingDateTimeFrom: {
      type: 'ref',
      columnType: 'timestamp',
      columnName: 'booking_date_time_from'
    },

    bookingDateTimeTo: {
      type: 'ref',
      columnType: 'timestamp',
      columnName: 'booking_date_time_to'
    },

    bookingStatus: {
      type: 'string',
      columnName: 'booking_status'
    },

    servicePriceId: {
      type: 'ref',
      columnType: 'int',
      columnName: 'service_price_id'
    },

    isActive: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_active'
    },

    createdDate: {
      type: 'ref',
      columnType: 'timestamptz',
      autoCreatedAt: true,
      columnName: 'created_date'
    },

    modifiedDate: {
      type: 'ref',
      columnType: 'timestamptz',
      autoUpdatedAt: true,
      columnName: 'modified_date'
    }
  }
};