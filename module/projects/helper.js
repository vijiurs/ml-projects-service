/**
 * name : helper.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Projects helper functionality.
 */

/**
    * projectsHelper
    * @class
*/

module.exports = class projectsHelper {

    /**
     * Lists of projects.
     * @method
     * @name projectDocument
     * @param {Array} [filterData = "all"] - project filter query.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [skipFields = "none"] - field not to include
     * @returns {Array} Lists of projects. 
     */
    
    static projectDocument(
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
               
               let templates = 
               await database.models.projects.find(
                   queryObject, 
                   projection
               ).lean();
           
               return resolve(templates);
           
           } catch (error) {
               return reject(error);
           }
       });
   }

    /**
      * List of projects.
      * @method
      * @name list
      * @param userId - logged in user id.
      * @returns {Object} Projects.
     */

    static list(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let projects = 
                await this.projectDocument(
                    {
                        userId : userId
                    },"all",[
                        "taskReport",
                        "createdFor",
                        "solutionId",
                        "solutionExternalId",
                        "programId",
                        "programExternalId",
                        "projectTemplateId",
                        "projectTemplateExternalId"
                    ]
                );

                if( !projects.length > 0 ) {
                    throw {
                        message : CONSTANTS.apiResponses.PROJECT_NOT_FOUND
                    }
                }

                for( let project = 0 ; project < projects.length ; project ++) {
                    let currentProject = projects[project];
                    currentProject.title = currentProject.metaInformation.title;
                    currentProject.goal = currentProject.metaInformation.goal;
                    currentProject.duration = currentProject.metaInformation.duration;
                    currentProject.entityInformation = 
                    _.pick(
                        currentProject.entityInformation,
                        ["externalId","name"]
                    );

                    currentProject.solutionInformation = 
                    _.pick(
                        currentProject.solutionInformation,
                        ["externalId","name","description","_id"]
                    );

                    currentProject.programInformation = _.pick(
                        currentProject.programInformation,
                        ["externalId","name","description","_id"]
                    );

                    delete currentProject.metaInformation;
                }


                return resolve({
                    message : CONSTANTS.apiResponses.PROJECTS_FETCHED,
                    result : projects
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

};


