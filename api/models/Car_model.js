/**
 * Car_model.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  primaryKey: 'carModelId',

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

    carModelId: {
      type: 'number',
      autoIncrement: true,
      columnName: 'car_model_id'
    },

    carCategoryId: {
      // type: 'number'
      type: 'ref',
      columnType: 'int',
      columnName: 'car_category_id'
    },

    carModelName: {
      type: 'string'
      , columnName: 'car_model_name'
    },

    carModelSlug: {
      type: 'string',
      columnName: 'car_model_slug'
    },

    securityDepositAmt: {
      type: 'number',
      columnName: 'security_deposit_amt'
    },

    isActive: {
      type: 'boolean',
      columnName: 'is_active'
    },

    modelImage: {
      type: 'string',
      columnName: 'model_image'
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

};

