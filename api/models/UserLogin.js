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
        //     model: 'requirements',
        //     type: 'number',
        //     autoIncrement: true,
        //     required: true,
        //     collection: 'requirements',
        //     via: 'userloginId'
        // },

        user_nicename: {
            type: 'string',
            maxLength: 250
        },

        login_username: {
            type: 'string',
            unique: true,
            maxLength: 250
        },

        login_password: {
            type: 'string',
            maxLength: 250
        },

        user_email: {
            type: 'string',
            isEmail: true,
            unique: true,
            maxLength: 250
        },

        is_admin: {
            type: 'boolean'
        },

        user_designation: {
            type: 'string',
            maxLength: 250
        },

        user_profile_img: {
            type: 'string',
            maxLength: 250,
            example: ''
        },

        is_deleted: {
            type: 'boolean'
        },

        reset_password: {
            type: 'boolean'
        },

        reset_password_datetime: {
            type: 'number'
        },

        dt_last_login: {
            type: 'number'
        },

        user_created_date: {
            type: 'number'
        }
    },


    setPassword: async function (password) {
        return await generatePasswordHash(password)
    },


    validatePassword: async function (password, usr_password) {
        return bcrypt.compare(password, usr_password);
    },

    // customToJSON: function (user) {
    //     return {
    //         id: user.id,
    //         username: user.login_username
    //     };
    // },

    customToJSON: function () {
        // Return a shallow copy of this record with the password and ssn removed.
        return _.omit(this, ['createdAt', 'updatedAt', 'login_password', 'user_email',
            'is_admin', 'user_designation', 'user_profile_img', 'is_deleted', 'reset_password',
            'reset_password_datetime', 'dt_last_login', 'user_created_date'])
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