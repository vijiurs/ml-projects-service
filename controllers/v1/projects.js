/**
 * name : projects.js
 * author : Aman
 * created-date : 20-July-2020
 * Description : Projects categories related information.
 */

// Dependencies

const projectsHelper = require(MODULES_BASE_PATH + "/projects/helper");

 /**
    * Projects
    * @class
*/

module.exports = class Projects extends Abstract {
    
    constructor() {
        super("projects");
    }

    static get name() {
        return "projects";
    }

     /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */

    /**
    * @api {get} /unnati/api/v1/projects/list List of projects.
    * @apiVersion 1.0.0
    * @apiName List of projects
    * @apiGroup Project Categories
    * @apiSampleRequest /unnati/api/v1/projects/list
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    * "message": "Project fetched successfully",
    * "status": 200,
    * "result": [
    ]}
    */

      /**
      * List of project
      * @method
      * @name list
      * @returns {JSON} returns a list of project.
     */

    async list() {
        return new Promise(async (resolve, reject) => {
            try {

                const projects = await projectsHelper.list();
                return resolve(projects);

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
                    errorObject: error
                });
            }
        })
    }

};