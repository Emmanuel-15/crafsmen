/**
 * Comments.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

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

    // id: {
    //   type: 'number',
    //   columnName: 'comment_id',
    //   autoIncrement: true
    // },

    requirement_id: {
      type: 'number',
      required: true
    },

    user_id: {
      model: 'userlogin'
    },

    comment_text: {
      type: 'string',
      required: true
    },

    comment_parent: {
      type: 'number',
    },

    step_comment: {
      type: 'number',
    },

    comment_type: {
      type: 'number',
    },

    is_active: {
      type: 'boolean'
    },

    is_attachment: {
      type: 'boolean',
    },

    file_path: {
      type: 'string',
    }
  },

};

