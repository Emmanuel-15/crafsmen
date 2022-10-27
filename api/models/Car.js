/**
 * Car.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  primaryKey: 'carId',

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

    carId: {
      type: 'number',
      autoIncrement: true,
      columnName: 'car_id'
    },

    carModelId: {
      // type: 'number',
      type: 'ref',
      columnType: 'int',  //check if it works without type: 'ref'.
      columnName: 'car_model_id'
    },

    carRegistrationNumber: {
      type: 'string',
      columnName: 'car_registration_number'
    },

    carDescription: {
      type: 'string',
      columnName: 'car_description'
    },

    carImage: {
      type: 'string',
      columnName: 'car_image'
    },

    carCapacity: {
      type: 'number',
      columnName: 'car_capacity'
    },

    heavyLuggage: {
      type: 'number',
      columnName: 'heavy_luggage'
    },

    lightLuggage: {
      type: 'number',
      columnName: 'light_luggage'
    },

    fuelType: {
      type: 'number',
      columnName: 'fuel_type'
    },

    musicSystem: {
      type: 'boolean',
      columnName: 'music_system'
    },

    airConditioning: {
      type: 'boolean',
      columnName: 'air_conditioning'
    },

    isTrash: {
      type: 'boolean',
      columnName: 'is_trash'
    },

    isActive: {
      type: 'boolean',
      columnName: 'is_active'
    },

    isDeleted: {
      type: 'boolean',
      columnName: 'is_deleted'
    },

    cdwInsurance: {
      type: 'boolean',
      columnName: 'cdw_insurance'
    },

    cdwInsuranceAmt: {
      type: 'number',
      columnName: 'cdw_insurance_amt'
    },

    hasAirbags: {
      type: 'boolean',
      columnName: 'has_airbags'
    },

    tubelessTyres: {
      type: 'boolean',
      columnName: 'tubeless_tyres'
    },

    hasGps: {
      type: 'boolean',
      columnName: 'has_gps'
    },

    hasSunroof: {
      type: 'boolean',
      columnName: 'has_sunroof'
    },

    carPaintColor: {
      type: 'string',
      columnName: 'car_paint_color'
    },

    isAutomatic: {
      type: 'boolean',
      columnName: 'is_automatic'
    },

    electricKmRange: {
      type: 'number',
      columnName: 'electric_km_range'
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

