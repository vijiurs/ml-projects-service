/**
 * name : sunbird.js
 * author : Aman Karki
 * Date : 05-Aug-2020
 * Description : All sunbird service related information.
 */

//dependencies

const request = require('request');

/**
  * Verify token is valid or not
  * @function
  * @name verifyToken
  * @param token - user token for verification 
  * @returns {JSON} - consist of token verification details
*/

const verifyToken = function (token) {
    return new Promise(async (resolve, reject) => {
        try {
            const url = 
            process.env.SUNBIRD_SERIVCE_HOST + 
            process.env.SUNBIRD_SERIVCE_BASE_URL + 
            CONSTANTS.endpoints.VERIFY_TOKEN;

            let options = {
                headers : {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "content-type": "application/json"
                },
                json : {
                    token : token
                }
            };

            request.post(url,options,sunbirdCallback);

            function sunbirdCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.SUNBIRD_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    verifyToken: verifyToken
};