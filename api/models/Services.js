/**
 * Services.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  primaryKey: 'serviceId',

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

    serviceId: {
      type: 'number',
      autoIncrement: true,
      columnName: 'service_id'
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
    },

    serviceTypeId: {
      type: 'number',
      columnName: 'service_type_id'
    },

    serviceImage: {
      type: 'string',
      columnName: 'service_image'
    },

    isActive: {
      type: 'boolean',
      columnName: 'is_active'
    },

    serviceTitle: {
      type: 'string',
      columnName: 'service_titile'
    },

    serviceDescription: {
      type: 'string',
      columnName: 'service_description'
    },

    serviceExcept: {
      type: 'string',
      columnName: 'service_except'
    }

  },

};

