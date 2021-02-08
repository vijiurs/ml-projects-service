/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Solution related helper functionality.
 */

// Dependencies

const kendraService = require(GENERICS_FILES_PATH + "/services/kendra");

/**
    * SolutionsHelper
    * @class
*/
module.exports = class SolutionsHelper {

  /**
   * Create solution.
   * @method create
   * @name create
   * @param {Object} requestedData - solution creation data.
   * @param {String} token - Logged in user token.
   * @returns {Object} solution creation data. 
   */
  
  static create(requestedData,token) {
    return new Promise(async (resolve, reject) => {
        try {

            requestedData.type = requestedData.subType = CONSTANTS.common.IMPROVEMENT_PROJECT;
            requestedData.resourceType = [CONSTANTS.common.RESOURCE_TYPE];
            requestedData.language = [CONSTANTS.common.ENGLISH_LANGUAGE];
            requestedData.keywords = [CONSTANTS.common.KEYWORDS];
            requestedData.isDeleted = false;
            requestedData.isReusable = false;
            
            let solutionCreated = 
            await kendraService.createSolution(requestedData,token);

            if( !solutionCreated.success ) {
              throw {
                message : CONSTANTS.apiResponses.IMPROVEMENT_PROJECT_SOLUTION_NOT_CREATED
              }
            }

            return resolve({
              success : true,
              message : CONSTANTS.apiResponses.IMPROVEMENT_PROJECT_SOLUTION_CREATED,
              data : solutionCreated.data
            });
            
        } catch (error) {
            return resolve({
              success : false,
              message : error.message
            });
        }
    });
  }

};
