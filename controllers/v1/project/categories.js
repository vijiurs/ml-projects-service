/**
 * name : categories.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Projects categories related information.
 */

// Dependencies

const projectCategoriesHelper = require(MODULES_BASE_PATH + "/project/categories/helper");

 /**
    * ProjectCategories
    * @class
*/

module.exports = class ProjectCategories extends Abstract {
    
    constructor() {
        super("project-categories");
    }

    static get name() {
        return "projectCategories";
    }

    /**
    * @api {get} /unnati/api/v1/project/categories/list List of projects categories.
    * @apiVersion 1.0.0
    * @apiName List of projects categories
    * @apiGroup Project Categories
    * @apiSampleRequest /unnati/api/v1/project/categories/list
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    * "message": "Project categories fetched successfully",
    * "status": 200,
    * "result": [
    * {
            "name": "Community",
            "type": "community",
            "updatedAt": "2020-07-16T09:51:43.533Z",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2Fdrafts.png?generation=1594893105112980&alt=media"
        },
        {
            "name": "Infrastructure",
            "type": "infrastructure",
            "updatedAt": "2020-07-16T09:51:43.533Z",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2FobservationSolutions.png?generation=1594893104772103&alt=media"
        },
        {
            "name": "Students",
            "type": "students",
            "updatedAt": "2020-07-16T09:51:43.533Z",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2FinstitutionalAssessments.png?generation=1594893104496585&alt=media"
        },
        {
            "name": "Teachers",
            "type": "teachers",
            "updatedAt": "2020-07-16T09:51:43.533Z",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2FindividualAssessments.png?generation=1594893104067373&alt=media"
        }
    ]}
    */

      /**
      * List of project categories
      * @method
      * @name list
      * @returns {JSON} returns a list of project categories.
     */

    async list() {
        return new Promise(async (resolve, reject) => {
            try {
                
                const projectCategories = await projectCategoriesHelper.list();
                return resolve(projectCategories);

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
