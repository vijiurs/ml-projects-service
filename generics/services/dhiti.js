/**
 * name : dhiti.js
 * author : Rakesh Kumar
 * Date : 10-Nov-2020
 * Description : All dhiti service related information.
 */

//dependencies

const request = require('request');

/**
  * To get view full report pdf
  * @function
  * @name viewFullReport
  * @param {String} token - user token for verification 
  * @param {String} input - input request body
  * @returns {JSON} - consist of pdf url
*/

const viewFullReport = function (token,input) {
    return new Promise(async (resolve, reject) => {
        try {
            const url = 
            process.env.DHITI_SERIVCE_HOST + 
            process.env.DHITI_SERIVCE_BASE_URL +
            CONSTANTS.endpoints.VIEW_PROJECT_REPORT;

            let options = {
                headers : {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "content-type": "application/json",
                    "x-auth-token": token
                },
                json : input
            };

            request.post(url,options,dhitiCallback);

            function dhitiCallback(err, data) {

                let result = {
                    success : true
                };
                if (err) {
                    result.success = false;
                } else {
                    result["data"] = data.body;
                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
*  To get entityReport pdf
* @function
* @name entityReport
* @param {String} token - user token for verification 
* @param {String} input - input request body
* @returns {JSON} - consist of pdf url
*/

const entityReport = function (token,input) {
  return new Promise(async (resolve, reject) => {
      try {
          const url = 
          process.env.DHITI_SERIVCE_HOST + 
          process.env.DHITI_SERIVCE_BASE_URL +
          CONSTANTS.endpoints.ENTITY_REPORT;

          let options = {
              headers : {
                  "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                  "content-type": "application/json",
                  "x-auth-token": token
              },
              json : input
          };

          request.post(url,options,dhitiCallback);

          function dhitiCallback(err, data) {
              let result = {
                  success : true
              };
              if (err) {
                  result.success = false;
              } else {
                  result["data"] = data.body;
              }
              return resolve(result);
          }

      } catch (error) {
          return reject(error);
      }
  })
}

module.exports = {
    viewFullReport: viewFullReport,
    entityReport:entityReport
};
