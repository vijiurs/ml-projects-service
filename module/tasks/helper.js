/**
 * name : helper.js
 * author : Aman
 * created-date : 18-Nov-2020
 * Description : Tasks related helper functionality
 */

// Dependencies

const UserProjectsHelper = require(MODULES_BASE_PATH + "/userProjects/helper");

/**
    * TasksHelper
    * @class
*/

module.exports = class TasksHelper {

    /**
    * Status of tasks.
    * @method
    * @name status 
    * @param {String} projectId - Project id.
    * @param {Array} taskIds - Tasks ids.
    * @returns {Object}
   */

    static status( projectId,taskIds = [] ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let aggregatedData = [{
                    $match : {
                        _id : ObjectId(projectId)
                    }
                }];

                if( taskIds.length > 0 ) {
                    
                    let unwindData = {
                        "$unwind" : "$tasks"
                    }

                    let matchData = {
                        "$match" : {
                            "tasks._id" : { $in : taskIds }
                        }
                    };

                    let groupData = {
                        "$group" : {
                            "_id" : "$_id",
                            "tasks" : { "$push" : "$tasks" }
                        }
                    }

                    aggregatedData.push(unwindData,matchData,groupData);
                }

                let projectData = {
                    "$project" : { "tasks" : 1 }
                }

                aggregatedData.push(projectData);

                let projects = await database.models.projects.aggregate(aggregatedData);

                if( !projects[0] ) {
                    
                    return resolve({
                        message : CONSTANTS.apiResponses.PROJECT_NOT_FOUND,
                        result : []
                    });
                }

                let projectTasks = projects[0].tasks;
                let result = [];

                for( let task = 0; task < projectTasks.length ; task ++ ) {
                    
                    let currentTask = projectTasks[task];
                    
                    let data = {
                        type : currentTask.type,
                        status : currentTask.status,
                        _id : currentTask._id
                    };
                    
                    result.push(data);
                }

                return resolve({
                    message : CONSTANTS.apiResponses.TASKS_STATUS_FETCHED,
                    result : result
                });

            } catch (error) {
                return reject(error);
            }
        })
    }
    
}