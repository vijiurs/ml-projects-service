/**
 * name : helper.js
 * author : Aman
 * created-date : 23-July-2020
 * Description : Entity types helper functionality.
 */

/**
    * EntityTypesHelper
    * @class
*/

module.exports = class EntityTypesHelper {

      /**
   * Entity types documents.
   * @method
   * @name entityTypesDocuments
   * @param {Object} [findQuery = "all"] - filtered data.
   * @param {Array} [fields = "all"] - projected data.
   * @param {Array} [skipFields = "none"] - fields to skip.
   * @returns {Array} - Entity types documents.
   */

  static entityTypesDocuments(
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

          let entityTypesData = 
          await database.models.entityTypes.find(
            queryObject, 
            projection
          ).lean();
          
          return resolve(entityTypesData);

      } catch (error) {
          return reject(error);
        }
      });
    }

};


