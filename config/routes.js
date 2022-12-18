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

<<<<<<< HEAD
    //services
    'POST   /api/v1/entrance/services': { controller: 'UserController', action: 'login' },
    'POST   /api/v1/entrance/services': { controller: 'UserController', action: 'create' },
    'POST   /api/v1/entrance/services': { controller: 'UserController', action: 'refreshToken' },
    'PUT   /api/v1/entrance/services': { controller: 'UserController', action: 'changePassword' },
=======
    //sourcing
    'GET    /api/v1/entrance/getallsourcing': { controller: 'SourceController', action: 'getallsourcing' },
    'GET    /api/v1/entrance/getsourcing': { controller: 'SourceController', action: 'getsourcing' },
    'POST   /api/v1/entrance/sourcing': { controller: 'SourceController', action: 'create' },
    'PUT   /api/v1/entrance/sourcing': { controller: 'SourceController', action: 'update' },
    'DELETE   /api/v1/entrance/sourcing': { controller: 'SourceController', action: 'delete' },

    //requirements
    'GET    /api/v1/entrance/allrequirement': { controller: 'RequirementsController', action: 'getAllRequirement' },
    'GET    /api/v1/entrance/requirement': { controller: 'RequirementsController', action: 'getRequirement' },
    'POST   /api/v1/entrance/requirement': { controller: 'RequirementsController', action: 'create' },
    'PUT    /api/v1/entrance/requirement': { controller: 'RequirementsController', action: 'update' },
    'DELETE   /api/v1/entrance/requirement': { controller: 'RequirementsController', action: 'delete' },

    //comments
    'GET   /api/v1/entrance/comments/:requirement_id/:step_comment': { controller: 'CommentsController', action: 'getComment' },
    'POST   /api/v1/entrance/comments': { controller: 'CommentsController', action: 'create' },
    'PUT   /api/v1/entrance/comments/:comment_id': { controller: 'CommentsController', action: 'update' },
    'DELETE   /api/v1/entrance/comments/:comment_id': { controller: 'CommentsController', action: 'delete' },
>>>>>>> e7073c0411dfbd61e62084cdc889ad2e7238aaf8
};