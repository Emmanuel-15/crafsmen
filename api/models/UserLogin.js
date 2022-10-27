/**
 * User-login.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { hash } = require('bcrypt');
const bcrypt = require('bcrypt');

function generatePasswordHash(password) {
    return bcrypt.genSalt(10) // 10 is default
        .then((salt) => {
            return bcrypt.hash(password, salt);
        })
        .then(hash => {
            return Promise.resolve(hash);
        });
}

module.exports = {

    primaryKey: 'user_id',

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

        user_id: {
            type: 'number',
            autoIncrement: true,
            // size: 100
        },

        login_username: {
            type: 'string',
            unique: true
        },

        login_password: {
            type: 'string'
        },

        user_name: {
            type: 'string'
        },

        user_address: {
            type: 'string'
        },

        user_email: {
            type: 'string',
            isEmail: true,
            unique: true
        },

        user_contact_number: {
            type: 'string'
        },

        user_gender: {
            type: 'number',
            columnType: 'smallint'
        },

        created_date: {
            type: 'ref',
            columnType: 'timestamptz',
            autoCreatedAt: true
        },

        modified_date: {
            type: 'ref',
            columnType: 'timestamptz',
            autoUpdatedAt: true
        },

        dt_last_login: {
            type: 'ref',
            columnType: 'timestamptz',
            // defaultsTo: '0000-00-00 00:00:00'
        },

        user_image: {
            type: 'string'
        },

        hash_code: {
            type: 'string'
        },

        reset_password: {
            type: 'number',
            columnType: 'smallint'
        }

    },


    setPassword: async function (password) {
        return await generatePasswordHash(password)
    },


    validatePassword: async function (password, usr_password) {
        return bcrypt.compare(password, usr_password);
    },


    customToJSON: function () {
        // Return a shallow copy of this record with the login_password removed.
        return _.omit(this, ['login_password']);
    },


    beforeCreate: function (values, next) {
        generatePasswordHash(values.login_password)
            .then(hash => {
                delete (values.login_password);
                values.login_password = hash;
                next();
            })
            .catch(err => {
                /* istanbul ignore next */
                next(err);
            });
    }

};