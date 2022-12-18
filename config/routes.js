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

    //service
    'GET   /api/v1/entrance/services': { controller: 'ServicesController', action: 'getAll' },
    'GET   /api/v1/entrance/services/:id': { controller: 'ServicesController', action: 'get' },
    'POST   /api/v1/entrance/services': { controller: 'ServicesController', action: 'create' },
    'PUT   /api/v1/entrance/services/:id': { controller: 'ServicesController', action: 'update' },
    'DELETE   /api/v1/entrance/services/:id': { controller: 'ServicesController', action: 'delete' },

    //service-type
    'GET   /api/v1/entrance/service-type': { controller: 'ServiceTypeController', action: 'getAll' },
    'GET   /api/v1/entrance/service-type/:id': { controller: 'ServiceTypeController', action: 'get' },
    'POST   /api/v1/entrance/service-type': { controller: 'ServiceTypeController', action: 'create' },
    'PUT   /api/v1/entrance/service-type/:id': { controller: 'ServiceTypeController', action: 'update' },
    'DELETE   /api/v1/entrance/service-type/:id': { controller: 'ServiceTypeController', action: 'delete' },
};