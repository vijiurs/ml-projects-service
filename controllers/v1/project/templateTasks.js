/**
 * name : templateTasks.js
 * author : Aman
 * created-date : 22-July-2020
 * Description : Projects template tasks related information.
 */

// Dependencies
const csv = require('csvtojson');
const projectTemplateTasksHelper = require(MODULES_BASE_PATH + "/project/templateTasks/helper");

 /**
    * ProjectTemplateTasks
    * @class
*/

module.exports = class ProjectTemplateTasks extends Abstract {
    
    constructor() {
        super("project-template-tasks");
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
    * @api {get} /unnati/api/v1/project/templateTasks/bulkCreate Bulk create project template tasks.
    * @apiVersion 1.0.0
    * @apiName Bulk create projects templates
    * @apiGroup Project Template Tasks
    * @apiParam {File} projectTemplateTasks Mandatory project template tasks file of type CSV.
    * @apiSampleRequest /unnati/api/v1/project/templateTasks/bulkCreate
    * @apiUse successBody
    * @apiUse errorBody

      /**
      * Upload project template tasks
      * @method
      * @name list
      * @returns {JSON} returns uploaded project templates.
     */

    async bulkCreate(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                if ( !req.files || !req.files.projectTemplateTasks ) {
                    return resolve(
                      { 
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATES_TASKS_CSV
                      }
                    )
                }

                const templateTasks = 
                await csv().fromString(req.files.projectTemplateTasks.data.toString());

                const projectTemplateTasks = 
                await projectTemplateTasksHelper.bulkCreate(
                    templateTasks,
                    req.userDetails.userId
                );

                return resolve(projectTemplateTasks);

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
                    errorObject: error
                });
            }
        })
    }

     /**
    * @api {get} /unnati/api/v1/project/templateTasks/bulkUpdate Bulk update project template tasks.
    * @apiVersion 1.0.0
    * @apiName Bulk update projects templates tasks
    * @apiGroup Project Template Tasks
    * @apiParam {File} projectTemplateTasks Mandatory project template tasks file of type CSV.
    * @apiSampleRequest /unnati/api/v1/project/templateTasks/bulkUpdate
    * @apiUse successBody
    * @apiUse errorBody

      /**
      * Upload project template tasks
      * @method
      * @name list
      * @returns {JSON} returns uploaded project templates.
     */

    async bulkUpdate(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                if ( !req.files || !req.files.projectTemplateTasks ) {
                    return resolve(
                      {
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATES_TASKS_CSV
                      }
                    )
                }

                const templateTasks = 
                await csv().fromString(
                    req.files.projectTemplateTasks.data.toString()
                );

                const projectTemplateTasks = 
                await projectTemplateTasksHelper.bulkUpdate(
                    templateTasks,
                    req.userDetails.userId
                );

                return resolve(projectTemplateTasks);

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
