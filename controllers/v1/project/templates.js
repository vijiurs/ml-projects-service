/**
 * name : templates.js
 * author : Aman
 * created-date : 22-July-2020
 * Description : Projects templates related information.
 */

// Dependencies

const csv = require('csvtojson');
const projectTemplatesHelper = require(MODULES_BASE_PATH + "/project/templates/helper");

 /**
    * ProjectTemplates
    * @class
*/

module.exports = class ProjectTemplates extends Abstract {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     * @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */
    
    constructor() {
        super("project-templates");
    }

    /**
    * @api {post} /improvement-project/api/v1/project/templates/bulkCreate 
    * Bulk Create projects templates.
    * @apiVersion 1.0.0
    * @apiGroup Project Templates
    * @apiParam {File} projectTemplates Mandatory project templates file of type CSV.
    * @apiSampleRequest /improvement-project/api/v1/project/templates/bulkCreate
    * @apiUse successBody
    * @apiUse errorBody
    */

      /**
      * Bulk Create project templates
      * @method
      * @name bulkCreate
      * @returns {JSON} returns uploaded project templates.
     */

    async bulkCreate(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                if ( !req.files || !req.files.projectTemplates ) {
                    return resolve(
                      {
                        status : HTTP_STATUS_CODE["bad_request"].status, 
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATES_CSV
                      }
                    )
                }

                const templatesData = 
                await csv().fromString(req.files.projectTemplates.data.toString());

                const projectTemplates = await projectTemplatesHelper.bulkCreate(
                    templatesData,
                    req.userDetails.userInformation.userId
                );

                return resolve(projectTemplates);

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
    * @api {post} /improvement-project/api/v1/project/templates/bulkUpdate 
    * Bulk Update projects templates.
    * @apiVersion 1.0.0
    * @apiGroup Project Templates
    * @apiParam {File} projectTemplates Mandatory project templates file of type CSV.
    * @apiSampleRequest /improvement-project/api/v1/project/templates/bulkUpdate
    * @apiUse successBody
    * @apiUse errorBody
    */

      /**
      * Bulk Update project templates
      * @method
      * @name bulkUpdate
      * @returns {JSON} returns uploaded project templates.
     */

    async bulkUpdate(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                if ( !req.files || !req.files.projectTemplates ) {
                    return resolve(
                      {
                        status : HTTP_STATUS_CODE["bad_request"].status, 
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATES_CSV
                      }
                    )
                }
                
                const templatesData = 
                await csv().fromString(req.files.projectTemplates.data.toString());

                const projectTemplates = await projectTemplatesHelper.bulkUpdate(
                    templatesData,
                    req.userDetails.userInformation.userId
                );

                return resolve(projectTemplates);

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
    * @api {post} /improvement-project/api/v1/project/templates/importProjectTemplate/:projectTemplateExternalId 
    * Import templates from existsing project templates.
    * @apiVersion 1.0.0
    * @apiGroup Project Templates
    * @apiSampleRequest /improvement-project/api/v1/project/templates/importProjectTemplate/template-1
    * @apiParamExample {json} Request: 
    * {
    * "externalId" : "template1"
    * }
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully created duplicate project templates",
    "status": 200,
    "result": {
        "_id": "5f2402f570d11462f8e9a591"
    }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

      /**
      * Import templates from existsing project templates.
      * @method
      * @name importProjectTemplate
      * @returns {JSON} returns imported project templates.
     */

    async importProjectTemplate(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const projectTemplates = 
                await projectTemplatesHelper.importProjectTemplate(
                    req.params._id,
                    req.userDetails.userInformation.userId,
                    req.userDetails.userToken,
                    req.query.solutionId ? req.query.solutionId : "",
                    req.body.data
                );

                return resolve({
                    message: projectTemplates.message,
                    result: projectTemplates.data
                });

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message
                });
            }
        })
    }

};
