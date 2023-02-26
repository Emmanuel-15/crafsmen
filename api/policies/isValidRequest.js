// policies/isLoggedIn.js
module.exports = async function (req, res, next) {
    // console.log("I am in isValidRequest:::")

    // If `req.me` is set, then we know that this request originated
    // from a logged-in user.  So we can safely proceed to the next policy--
    // or, if this is the last policy, the relevant action.
    // > For more about where `req.me` comes from, check out this app's
    // > custom hook (`api/hooks/custom/index.js`).

    // console.log("I am in isValidRequest: ", req.route);
    // console.log("I am req.route: ", req.route.methods);

    // if (req.route.methods.get)
    //     console.log("Working")

    // if (req.me) {
    //    
    // }
    return next();

    //--•
    // Otherwise, this request did not come from a logged-in user.
    // return res.forbidden();

};