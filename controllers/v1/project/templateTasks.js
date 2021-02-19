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
    
    constructor() {
        super("project-template-tasks");
    }

    /**
    * @api {post} /improvement-project/api/v1/project/templateTasks/bulkCreate/:projectTemplateId 
    * Bulk create project template tasks.
    * @apiVersion 1.0.0
    * @apiGroup Project Template Tasks
    * @apiParam {File} projectTemplateTasks Mandatory project template tasks file of type CSV.
    * @apiSampleRequest /improvement-project/api/v1/project/templateTasks/bulkCreate/5f2adc57eb351a5a9c68f403
    * @apiUse successBody
    * @apiUse errorBody
    */

      /**
      * Upload project template tasks
      * @method
      * @name bulkCreate
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
                    req.params._id,
                    req.userDetails.userInformation.userId,
                    req.userDetails.userToken
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
    * @api {post} /improvement-project/api/v1/project/templateTasks/bulkUpdate/:projectTemplateId 
    * Bulk update project template tasks.
    * @apiVersion 1.0.0
    * @apiGroup Project Template Tasks
    * @apiParam {File} projectTemplateTasks Mandatory project template tasks file of type CSV.
    * @apiSampleRequest /improvement-project/api/v1/project/templateTasks/bulkUpdate/5f2adc57eb351a5a9c68f403
    * @apiUse successBody
    * @apiUse errorBody
    */

      /**
      * Upload project template tasks
      * @method
      * @name bulkUpdate
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
                    req.params._id,
                    req.userDetails.userInformation.userId,
                    req.userDetails.userToken
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
