/**
 * unauthorized.js
 *
 * A custom response that content-negotiates the current request to either:
 *  • log out the current user and redirect them to the login page
 *  • or send back 401 (Unauthorized) with no response body.
 *
 * Example usage:
 * ```
 *     return res.unauthorized();
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       badCombo: {
 *         description: 'That email address and password combination is not recognized.',
 *         responseType: 'unauthorized'
 *       }
 *     }
 * ```
 */
module.exports = function unauthorized(message) {
    // console.log("No Authorised");
    var req = this.req;
    var res = this.res;

    sails.log.verbose('Ran custom response: res.unauthorized()');

    // Set status code
    res.status(401);

    // If appropriate, serve data as JSON(P)
    // If views are disabled, revert to json
    if (req.wantsJSON || sails.config.hooks.views === false) {
        return res.json(message);
    }
    // Or log them out (if necessary) and then redirect to the login page.
    else {

        if (req.session.userId) {
            delete req.session.userId;
        }

        return res.redirect('/login');
    }

};