/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */


module.exports.routes = {
    // user
    'POST   /api/v1/entrance/login': { controller: 'UserController', action: 'login' },
    'POST   /api/v1/entrance/create': { controller: 'UserController', action: 'create' },
    'POST   /api/v1/entrance/refreshToken': { controller: 'UserController', action: 'refreshToken' },
    'PUT   /api/v1/entrance/changePassword': { controller: 'UserController', action: 'changePassword' },

    // customer
    'GET    /api/v1/entrance/customer': { controller: 'CustomerController', action: 'getAll' },
    'POST   /api/v1/entrance/customer': { controller: 'CustomerController', action: 'create' },
    'POST   /api/v1/entrance/validate-customer': { controller: 'CustomerController', action: 'validate' },
    'DELETE   /api/v1/entrance/customer/:id': { controller: 'CustomerController', action: 'delete' },

    'GET   /api/v1/entrance/customer-details': { controller: 'CustomerController', action: 'getDetails' },
    'POST   /api/v1/entrance/customer-details': { controller: 'CustomerController', action: 'enterDetails' },

    // service
    'GET   /api/v1/entrance/services': { controller: 'ServicesController', action: 'getAll' },
    'GET   /api/v1/entrance/services/:id': { controller: 'ServicesController', action: 'get' },
    'POST   /api/v1/entrance/services': { controller: 'ServicesController', action: 'create' },
    'PUT   /api/v1/entrance/services/:id': { controller: 'ServicesController', action: 'update' },
    'DELETE   /api/v1/entrance/services/:id': { controller: 'ServicesController', action: 'delete' },
    'GET   /api/v1/entrance/service-details/:id': { controller: 'ServicesController', action: 'getDetails' },

    // service-type
    'GET   /api/v1/entrance/service-type': { controller: 'ServiceTypeController', action: 'getAll' },
    'GET   /api/v1/entrance/service-type/:id': { controller: 'ServiceTypeController', action: 'get' },
    'POST   /api/v1/entrance/service-type': { controller: 'ServiceTypeController', action: 'create' },
    'PUT   /api/v1/entrance/service-type/:id': { controller: 'ServiceTypeController', action: 'update' },
    'DELETE   /api/v1/entrance/service-type/:id': { controller: 'ServiceTypeController', action: 'delete' },

    // service-price
    'GET   /api/v1/entrance/service-price': { controller: 'ServicePriceController', action: 'getAll' },
    'GET   /api/v1/entrance/service-price/:id': { controller: 'ServicePriceController', action: 'get' },
    'POST   /api/v1/entrance/service-price': { controller: 'ServicePriceController', action: 'create' },
    'PUT   /api/v1/entrance/service-price/:id': { controller: 'ServicePriceController', action: 'update' },
    'DELETE   /api/v1/entrance/service-price/:id': { controller: 'ServicePriceController', action: 'delete' },

    // contractos
    'GET   /api/v1/entrance/contractors': { controller: 'ContractorsController', action: 'getAll' },
    'GET   /api/v1/entrance/contractors/:id': { controller: 'ContractorsController', action: 'get' },
    'POST   /api/v1/entrance/contractors': { controller: 'ContractorsController', action: 'create' },
    'PUT   /api/v1/entrance/contractors/:id': { controller: 'ContractorsController', action: 'update' },
    'DELETE   /api/v1/entrance/contractors/:id': { controller: 'ContractorsController', action: 'delete' },

    // contractor-services
    'GET   /api/v1/entrance/contractor-services': { controller: 'ContractorServicesController', action: 'getAll' },
    'GET   /api/v1/entrance/contractor-services/:id': { controller: 'ContractorServicesController', action: 'get' },
    'POST   /api/v1/entrance/contractor-services': { controller: 'ContractorServicesController', action: 'create' },
    'PUT   /api/v1/entrance/contractor-services/:id': { controller: 'ContractorServicesController', action: 'update' },
    'DELETE   /api/v1/entrance/contractor-services/:id': { controller: 'ContractorServicesController', action: 'delete' },

    // bookings
    'GET   /api/v1/entrance/bookings': { controller: 'BookingsController', action: 'getAll' },
    'GET   /api/v1/entrance/bookings/:id': { controller: 'BookingsController', action: 'get' },
    'POST   /api/v1/entrance/bookings': { controller: 'BookingsController', action: 'create' },
    'PUT   /api/v1/entrance/bookings/:id': { controller: 'BookingsController', action: 'update' },
    'DELETE   /api/v1/entrance/bookings/:id': { controller: 'BookingsController', action: 'delete' },

    'GET   /api/v1/entrance/customer-bookings': { controller: 'BookingsController', action: 'customerBookings' },
    'DELETE   /api/v1/entrance/cancel-bookings/:id': { controller: 'BookingsController', action: 'cancelBookings' },
    'GET   /api/v1/entrance/bookings-count': { controller: 'BookingsController', action: 'bookingsCount' },

    //generic controller
    'POST    /api/v1/entrance/upload-image': { controller: 'GenericController', action: 'upload' }
};