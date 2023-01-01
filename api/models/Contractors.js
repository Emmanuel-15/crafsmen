/**
 * Contractors.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  primaryKey: 'contractorId',

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

    contractorId: {
      type: 'number',
      autoIncrement: true,
      columnName: 'contractor_id'
    },

    contractorName: {
      type: 'string',
      columnName: 'contractor_name'
    },

    contractorAddress: {
      type: 'string',
      columnName: 'contractor_address'
    },

    contactNumber1: {
      type: 'string',
      columnName: 'contact_number1'
    },

    contactNumber2: {
      type: 'string',
      allowNull: true,
      columnName: 'contact_number2'
    },

    contractorEmail: {
      type: 'string',
      columnName: 'contractor_email'
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
  },

  customToJSON: function () {
    // Return a shallow copy of this record with the creatain fields removed.
    return _.omit(this, ['isActive', 'modifiedDate']);
  },
};