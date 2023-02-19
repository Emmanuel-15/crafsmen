/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

    /***************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions, unless overridden.       *
     * (`true` allows public access)                                            *
     *                                                                          *
     ***************************************************************************/

    '*': 'jwtAuth',

    'userController': {
        'create': true,
        'login': true,
        'refreshToken': true
    },

    'servicesController': {
        'getAll': true,
        'get': true,
        'getDetails': true
    },

    'serviceTypeController': {
        'getAll': true,
        'get': true
    },

    'customerController': {
        'create': true,
        'validate': true
    },

    'genericController': {
        'contactUs': true
    }

    // '*': ['isValidRequest', 'jwtAuth'],

    // 'userController': {
    //     'create': true,
    //     'login': true,
    //     'refreshToken': true
    // },

    // 'servicesController': {
    //     'getAll': 'isValidRequest'
    // },

    // 'customerController': {
    //     'create': 'isValidRequest',
    //     'validate': 'isValidRequest'
    // }
};