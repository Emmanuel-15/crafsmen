/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

const UserController = require("../api/controllers/UserController");

module.exports.routes = {
    //user
    'POST   /api/v1/entrance/login': { controller: 'UserController', action: 'login' },
    'POST   /api/v1/entrance/create': { controller: 'UserController', action: 'create' },
    'POST   /api/v1/entrance/refreshToken': { controller: 'UserController', action: 'refreshToken' },
    'PUT   /api/v1/entrance/changePassword': { controller: 'UserController', action: 'changePassword' },

    //services
    'POST   /api/v1/entrance/services': { controller: 'UserController', action: 'login' },
    'POST   /api/v1/entrance/services': { controller: 'UserController', action: 'create' },
    'POST   /api/v1/entrance/services': { controller: 'UserController', action: 'refreshToken' },
    'PUT   /api/v1/entrance/services': { controller: 'UserController', action: 'changePassword' },
};