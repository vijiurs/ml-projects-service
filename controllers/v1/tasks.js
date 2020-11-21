/**
 * name : tasks.js
 * author : Aman
 * created-date : 18-Nov-2020
 * Description : Tasks related information.
 */

// Dependencies
const tasksHelper = require(MODULES_BASE_PATH + "/tasks/helper");

/**
   * Tasks
   * @class
*/

module.exports = class Tasks {

    static get name() {
        return "tasks";
    }

    /**
    * @api {post} /improvement-project/api/v1/tasks/status/:projectId
    * Tasks status.
    * @apiVersion 1.0.0
    * @apiGroup Tasks
    * @apiSampleRequest /improvement-project/api/v1/tasks/status/5f731631e8d7cd3b88ac0659
    * @apiParamExample {json} Request:
    * {
    * "taskIds" : ["e3679cab-71b1-4229-bca5-06b275cde65b"]
    * }
    * @apiParamExample {json} Response:
    * {
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Tasks status
      * @method
      * @name status
      * @param {Object} req - request data.
      * @param {String} req.params._id - Project id.
      * @returns {JSON} status of tasks
     */
    
    async status(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const taskStatus = await tasksHelper.status(
                    req.params._id,
                    req.body.taskIds
                );
                
                return resolve(taskStatus);

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