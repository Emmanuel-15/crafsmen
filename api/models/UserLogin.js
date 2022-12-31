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
            allowNull: true,
            columnName: 'login_username'
        },

        loginPassword: {
            type: 'string',
            allowNull: true,
            columnName: 'login_password'
        },

        userName: {
            type: 'string',
            allowNull: true,
            columnName: 'user_name'
        },

        userAddress: {
            type: 'string',
            allowNull: true,
            columnName: 'user_address'
        },

        userEmail: {
            type: 'string',
            isEmail: true,
            unique: true,
            allowNull: true,
            columnName: 'user_email'
        },

        userContactNumber: {
            type: 'string',
            allowNull: true,
            columnName: 'user_contact_number'
        },

        userGender: {
            type: 'boolean',
            allowNull: true,
            columnName: 'user_gender'
        },

        userImage: {
            type: 'string',
            allowNull: true,
            columnName: 'user_image'
        },

        hashCode: {
            type: 'string',
            columnName: 'hash_code'
        },

        isAdmin: {
            type: 'boolean',
            defaultsTo: false,
            columnName: 'is_admin'
        },

        isActive: {
            type: 'boolean',
            defaultsTo: true,
            columnName: 'is_active'
        },

        resetPassword: {
            type: 'boolean',
            columnName: 'reset_password'
        },

        dtLastLogin: {
            type: 'ref',
            columnType: 'timestamp',
            columnName: 'dt_last_login'
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

    setPassword: async function (password) {
        return await generatePasswordHash(password)
    },

    validatePassword: async function (password, usr_password) {
        return bcrypt.compare(password, usr_password);
    },

    customToJSON: function () {
        // Return a shallow copy of this record with the creatain fields removed.
        return _.omit(this, ['loginUsername', 'loginPassword', 'createdDate', 'modifiedDate',
            'dtLastLogin', 'hashCode', 'isAdmin', 'isActive', 'resetPassword']);
    },

    beforeCreate: function (values, next) {
        if (values.loginPassword.length == 0)
            next();
        else {
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
    }
};