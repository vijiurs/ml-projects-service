/**
 * name : helper.js
 * author : Aman
 * created-date : 23-July-2020
 * Description : User roles helper functionality.
 */

/**
    * UserRolesHelper
    * @class
*/

module.exports = class UserRolesHelper {

      /**
   * User roles data.
   * @method
   * @name rolesDocuments
   * @param {Object} [findQuery = "all"] - filtered data.
   * @param {Array} [fields = "all"] - projected data.
   * @param {Array} [skipFields = "none"] - fields to skip.
   * @returns {Array} - User roles data.
   */

  static rolesDocuments(
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

          let userRolesData = 
          await database.models.userRoles.find(
            queryObject, 
            projection
          ).lean();
          
          return resolve(userRolesData);

      } catch (error) {
          return reject(error);
        }
      });
    }

};


