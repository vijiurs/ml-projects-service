/**
 * name : solutions.js
 * author : Aman
 * created-date : 18-Nov-2020
 * Description : solutions related information.
 */

// Dependencies
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");

/**
   * Solutions
   * @class
*/

module.exports = class Solutions {

    static get name() {
        return "tasks";
    }

    /**
    * @api {get} /improvement-project/api/v1/solutions/details/:projectId?taskId=:taskId
    * Solutions details 
    * @apiVersion 1.0.0
    * @apiGroup Tasks
    * @apiSampleRequest /improvement-project/api/v1/solutions/details/5f731631e8d7cd3b88ac0659?taskId=e3679cab-71b1-4229-bca5-06b275cde65b
    * @apiParamExample {json} Response:
    * {
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Solutions details information.
      * @method
      * @name status
      * @param {Object} req - request data.
      * @param {String} req.params._id - Project id.
      * @returns {JSON} details of solutions
     */
    
    async details(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const solutionDetails = await solutionsHelper.details(
                    req.userDetails.userToken,
                    req.params._id,
                    req.query.taskId
                );
                
                return resolve(solutionDetails);

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
                    errorObject: error
                });
            }
        })
    }

}