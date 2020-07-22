/**
 * name : helper.js
 * author : Aman
 * created-date : 31-July-2020
 * Description : solutions helper functionality.
 */

/**
    * SolutionsHelper
    * @class
*/

module.exports = class SolutionsHelper {

    /**
     * Lists of solutions data.
     * @method
     * @name solutionDocuments
     * @param {Array} [filterData = "all"] - tasks filter query.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [skipFields = "none"] - field not to include
     * @returns {Array} Lists of solutions data. 
     */
    
    static solutionDocuments(
        filterData = "all", 
        fieldsArray = "all",
        skipFields = "none"
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let queryObject = (filterData != "all") ? filterData : {};
                let projection = {}
           
                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                   });
               }
               
               if( skipFields !== "none" ) {
                   skipFields.forEach(field=>{
                       projection[field] = 0;
                   });
               }
               
               let solutionsData = 
               await database.models.solutions.find(
                   queryObject, 
                   projection
               ).lean();
           
               return resolve(solutionsData);
           
           } catch (error) {
               return reject(error);
           }
       });
    }

};


