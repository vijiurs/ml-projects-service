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
    
    constructor() {
        super("project-templates");
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
    * @api {get} /unnati/api/v1/project/templates/bulkCreate Bulk Create projects templates.
    * @apiVersion 1.0.0
    * @apiName Bulk Create projects templates
    * @apiGroup Project Templates
    * @apiParam {File} projectTemplates Mandatory project templates file of type CSV.
    * @apiSampleRequest /unnati/api/v1/project/templates/bulkCreate
    * @apiUse successBody
    * @apiUse errorBody

      /**
      * Bulk Create project templates
      * @method
      * @name list
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
                    req.userDetails.userId
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
    * @api {get} /unnati/api/v1/project/templates/bulkUpdate Bulk Update projects templates.
    * @apiVersion 1.0.0
    * @apiName Bulk Update projects templates
    * @apiGroup Project Templates
    * @apiParam {File} projectTemplates Mandatory project templates file of type CSV.
    * @apiSampleRequest /unnati/api/v1/project/templates/bulkUpdate
    * @apiUse successBody
    * @apiUse errorBody

      /**
      * Bulk Update project templates
      * @method
      * @name list
      * @returns {JSON} returns uploaded project templates.
     */

    async bulkUpdate(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                if ( !req.files || !req.files.projectTemplates ) {
                    return resolve(
                      {
                        status : HTTP_STATUS_CODE["bad_request"].status, 
                        message : constants.apiResponses.PROJECT_TEMPLATES_CSV
                      }
                    )
                }
                
                const templatesData = 
                await csv().fromString(req.files.projectTemplates.data.toString());

                const projectTemplates = await projectTemplatesHelper.bulkUpdate(
                    templatesData,
                    req.userDetails.userId
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
    * @api {post} /unnati/api/v1/project/templates/importFromTemplates/:projectTemplateExternalId?solutionId=:solutionExternalId Import templates from existsing project templates.
    * @apiVersion 1.0.0
    * @apiName Import templates from existsing project templates.
    * @apiGroup Project Templates
    * @apiSampleRequest /unnati/api/v1/project/templates/importFromTemplates/template-1?solutionId=EF-DCPCR-2018-001
    * @apiParamExample {json} Request: 
    * {
    * "externalId" : "template1"
    * }
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully created duplicate project templates",
    "status": 200,
    "result": {
        "_id": "5f2402f570d11462f8e9a591"
    },
    "success": true
    }

      /**
      * Import templates from existsing project templates.
      * @method
      * @name list
      * @returns {JSON} returns imported project templates.
     */

    async importFromTemplates(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const projectTemplates = 
                await projectTemplatesHelper.importFromTemplates(
                    req.params._id,
                    req.query.solutionId,
                    req.body.data
                );

                return resolve(projectTemplates);

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message
                });
            }
        })
    }

};
