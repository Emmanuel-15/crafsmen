const APIErrors = require("../constants/APIErrors");

module.exports = {
    isValidRequest(req, res, requestType, hasParams, hasBody) {
        return new Promise((resolve, reject) => {
            if (req.method !== requestType)
                return res.notFound();


            if (hasParams) {
                console.log("rejected")
                if (_.isEmpty(req.param))
                    reject(APIErrors.NOT_ALLOWED);
                // return res.badRequest(Utils.jsonErr("NO_PARAMS_FOUND"));
            }


            if (hasBody) {
                if (_.isEmpty(req.body))
                    return res.badRequest(Utils.jsonErr("EMPTY_BODY"));
            }
        })
    },
}