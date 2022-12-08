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

module.exports.routes = {  //this is develop.
    //user
    'POST   /api/v1/entrance/login': { controller: 'UserController', action: 'login' },
    'POST   /api/v1/entrance/create': { controller: 'UserController', action: 'create' },
    'POST   /api/v1/entrance/refreshToken': { controller: 'UserController', action: 'refreshToken' },
    'PUT   /api/v1/entrance/changePassword': { controller: 'UserController', action: 'changePassword' },


    //car category
    'GET    /api/v1/entrance/car-category': { controller: 'CarcategoryController', action: 'getAll' },
    'GET    /api/v1/entrance/car-category/:id': { controller: 'CarcategoryController', action: 'get' },
    'POST    /api/v1/entrance/car-category': { controller: 'CarcategoryController', action: 'create' },
    'PUT    /api/v1/entrance/car-category/:id': { controller: 'CarcategoryController', action: 'update' },
    'DELETE    /api/v1/entrance/car-category/:id': { controller: 'CarcategoryController', action: 'delete' },


    //car model
    'GET    /api/v1/entrance/car-model': { controller: 'carmodelController', action: 'getAll' },
    'GET    /api/v1/entrance/car-model/:id': { controller: 'carmodelController', action: 'get' },
    'POST    /api/v1/entrance/car-model': { controller: 'carmodelController', action: 'create' },
    'PUT    /api/v1/entrance/car-model/:id': { controller: 'carmodelController', action: 'update' },
    'DELETE    /api/v1/entrance/car-model/:id': { controller: 'carmodelController', action: 'delete' },


    //car
    'GET    /api/v1/entrance/car': { controller: 'carController', action: 'getAll' },
    'GET    /api/v1/entrance/car/:id': { controller: 'carController', action: 'get' },
    'POST    /api/v1/entrance/car': { controller: 'carController', action: 'create' },
    'PUT    /api/v1/entrance/car/:id': { controller: 'carController', action: 'update' },
    'DELETE    /api/v1/entrance/car/:id': { controller: 'carController', action: 'delete' },

    //generic controller
    'POST    /api/v1/entrance/upload': { controller: 'GenericController', action: 'upload' },

};