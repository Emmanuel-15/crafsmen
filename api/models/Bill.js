/**
 * Bill.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  primaryKey: 'bill_id',

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

    bill_id: {
      type: 'number',
      autoIncrement: true
    },

    bill_amount: {
      type: 'number',
      columnType: 'float'
    },

    payment_type: {
      type: 'string'
    },

    pickup_price: {
      type: 'number',
      columnType: 'float'
    },

    drop_price: {
      type: 'number',
      columnType: 'float'
    },

    base_fare: {
      type: 'number',
      columnType: 'float'
    },

    tax_amount: {
      type: 'number',
      columnType: 'float'
    },

    cdw_insurance_amt: {
      type: 'number',
      columnType: 'float'
    },

    security_deposit_amt: {
      type: 'number',
      columnType: 'float'
    },

    other_details: {
      type: 'string'
    },

    sub_total: {
      type: 'number',
      columnType: 'float'
    },

    created_date: {
      type: 'number',
      autoCreatedAt: true
    },

    modified_date: {
      type: 'ref',
      columnType: 'timestamptz',
      autoCreatedAt: true
    }

  },

};

