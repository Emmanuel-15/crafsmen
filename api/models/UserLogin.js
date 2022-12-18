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

    primaryKey: 'userId',

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

        userId: {
            type: 'number',
            autoIncrement: true,
            columnName: 'user_id'
            // size: 100
        },

        loginUsername: {
            type: 'string',
            unique: true,
            columnName: 'login_username'
        },

        loginPassword: {
            type: 'string',
            columnName: 'login_password'
        },

        userName: {
            type: 'string',
            columnName: 'user_name'
        },

        userAddress: {
            type: 'string',
            columnName: 'user_address'
        },

        userEmail: {
            type: 'string',
            isEmail: true,
            unique: true,
            columnName: 'user_email'
        },

        userContactNumber: {
            type: 'string',
            columnName: 'user_contact_number'
        },

        userGender: {
            type: 'number',
            columnType: 'smallint',
            columnName: 'user_gender'
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

        dtLastLogin: {
            type: 'ref',
            columnType: 'timestamptz',
            // defaultsTo: '0000-00-00 00:00:00',
            columnName: 'dt_last_login'
        },

        userImage: {
            type: 'string',
            columnName: 'user_image'
        },

        hashCode: {
            type: 'string',
            columnName: 'hash_code'
        },

        isAdmin: {
            type: 'number',
            columnType: 'smallint',
            columnName: 'is_admin'
        },

        resetPassword: {
            type: 'number',
            columnType: 'smallint',
            columnName: 'reset_password'
        }

    },


    setPassword: async function (password) {
        return await generatePasswordHash(password)
    },


    validatePassword: async function (password, usr_password) {
        return bcrypt.compare(password, usr_password);
    },


    customToJSON: function () {
        // Return a shallow copy of this record with the loginPassword removed.
        return _.omit(this, ['userId', 'loginUsername', 'loginPassword', 'userName', 'userAddress',
            'userEmail', 'userContactNumber', 'userGender', 'createdDate', 'modifiedDate', 'dtLastLogin',
            'userImage', 'hashCode', 'isAdmin', 'resetPassword']);
    },


    beforeCreate: function (values, next) {
        generatePasswordHash(values.loginPassword)
            .then(hash => {
                delete (values.loginPassword);
                values.loginPassword = hash;
                next();
            })
            .catch(err => {
                /* istanbul ignore next */
                next(err);
            });
    }

};