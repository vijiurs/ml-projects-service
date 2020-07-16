/**
 * name : helper.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Project categories helper functionality.
 */

// Dependencies 
const kendraService = require(PROJECT_ROOT_DIRECTORY + "/generics/services/kendra");
const sessionHelpers = require(PROJECT_ROOT_DIRECTORY+"/generics/helpers/sessions");

/**
    * projectCategoriesHelper
    * @class
*/

module.exports = class ProjectCategoriesHelper {

      /**
   * Project categories documents.
   * @method
   * @name categoryDocuments
   * @param {Object} [findQuery = "all"] - filtered data.
   * @param {Array} [fields = "all"] - projected data.
   * @param {Array} [skipFields = "none"] - fields to skip.
   * @returns {Array} - Project categories data.
   */

  static categoryDocuments(
    findQuery = "all", 
    fields = "all",
    skipFields = "none"
  ) {
      return new Promise(async (resolve, reject) => {
        
        try {
          
          let queryObject = {};

          if (findQuery != "all") {
              queryObject = findQuery;
          }

          let projection = {};

          if (fields != "all") {
              fields.forEach(element => {
                  projection[element] = 1;
              });
          }

          if (skipFields != "none") {
              skipFields.forEach(element => {
                  projection[element] = 0;
              });
          }

          let projectCategoriesData = 
          await database.models.projectCategories.find(
            queryObject, 
            projection
          ).lean();
          
          return resolve(projectCategoriesData);

      } catch (error) {
          return reject(error);
        }
      });
    }

    /**
      * List of project categories.
      * @method
      * @name list
      * @returns {Object} Project categories.
     */

    static list() {
        return new Promise(async (resolve, reject) => {
            try {

                let result = "";
                let projectCategoryData = sessionHelpers.get("projectCategories");

                if( projectCategoryData && projectCategoryData.length > 0 ) {
                    result = projectCategoryData;
                } else {
                    result = await this.set();
                }

                return resolve({
                  message : CONSTANTS.apiResponses.PROJECT_CATEGORIES_FETCHED,
                  result : result
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Set project categories.
      * @method
      * @name set
      * @returns {Object} Set project categories.
     */

    static set() {
        return new Promise(async (resolve, reject) => {
            try {

                let projectCategoriesData = 
                await this.categoryDocuments(
                    {
                        status : CONSTANTS.common.ACTIVE_STATUS
                    },
                    [
                        "externalId",
                        "name",
                        "icon",
                        "updatedAt"
                    ]
                );
                
                if( !projectCategoriesData.length > 0 ) {
                    throw {
                        status : HTTP_STATUS_CODE.bad_request.status,
                        message : CONSTANTS.apiResponses.LIBRARY_CATEGORIES_NOT_FOUND,
                        result : []
                    }
                }
    
                let categories = {};
                let icons = [];
                
                projectCategoriesData.map(category => {
                    
                    categories[category.icon] = {
                        name : category.name,
                        type : category.externalId,
                        updatedAt : category.updatedAt
                    };

                    if( category.icon !== "" ) {
                        icons.push(category.icon);
                    }

                });

                let projectCategories = "";

                if( icons.length > 0 ) {
                    
                    projectCategories = 
                    await kendraService.getDownloadableUrl(
                        {
                            filePaths : icons
                        }
                    );
                    
                    if( projectCategories.status !== HTTP_STATUS_CODE.ok.status) {
                        throw {
                            status : HTTP_STATUS_CODE.bad_request.status,
                            message : CONSTANTS.apiResponses.URL_COULD_NOT_BE_FOUND,
                            result : []
                        }
                    }

                    projectCategories = 
                    projectCategories.result.map(downloadableImage=>{
                        return _.merge(
                            categories[downloadableImage.filePath],
                            { url : downloadableImage.url }
                        )
                    });
                } else {
                    projectCategories = Object.values(categories);
                }

                projectCategories = projectCategories.sort((a,b)=> a.name.toString() > b.name.toString() ? 1 : -1);

                sessionHelpers.set("projectCategories",projectCategories);

                return resolve(projectCategories);

            } catch (error) {
                return reject(error);
            }
        })
    }

};


