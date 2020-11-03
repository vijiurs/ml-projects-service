/**
 * name : helper.js
 * author : Rakesh
 * created-date : 01-Nov-2020
 * Description : Entity report functionalities
 */

 // Dependencies

 const UserProjectsHelper = require(MODULES_BASE_PATH + "/userProjects/helper");
 const mongoose = require('mongoose');
 const moment = require('moment');



/**
    * Report Helper
    * @class
*/

module.exports = class ReportsHelper {

      /**
      * Entity Report.
      * @method
      * @name entity 
      * @param {String} entityId - mapped entity id.
      * @param {Object} requestedData - body data.
      * @param {String} userId - Logged in user id.
      * @param {String} reportType - report type monthly or quterly.
      * @param {String} programName - program name
      * @param {String} categories - array of categories
      * @returns {Object} Entity report.
     */
    static entity(entityId,userId,reportType,programName = "" ,categories = []) {
        return new Promise(async (resolve, reject) => {
            try {

                let query = {
                    "entityInformation._id": mongoose.Types.ObjectId(entityId),
                    userId : userId
                }

                var endOf = "";
                var startFrom = "";
                if (reportType == "lastQuarter") {
                    endOf = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                    startFrom = moment().subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                } else {
                    endOf = moment().subtract(0, 'months').endOf('month').format('YYYY-MM-DD');
                    startFrom = moment().subtract(0, 'months').startOf('month').format('YYYY-MM-DD');
                    let currentDate = moment().format('YYYY-MM-DD');
                    if (currentDate != endOf) {
                        endOf = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                        startFrom = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
                    }
                }
                query['$or'] = [
                    { "lastSync" : { $gte: new Date(startFrom), $lte: new Date(endOf) } },
                    { "tasks" : { $elemMatch : { lastSync: { $gte: new Date(startFrom), $lte: new Date(endOf) } } } },
                ]
                
                if(categories && categories.length > 0){

                    let categoriesArray = []
                    categories.map(category=>{
                        categoriesArray.push( mongoose.Types.ObjectId(category));
                    });
                    query['categories'] = { $elemMatch : { "_id" : { $in: categoriesArray } } }
                }
              
                if(programName){
                    query['programInformation.name'] = programName;
                }

                const projectDetails = await UserProjectsHelper.projectDocument(
                    query,
                    "all",
                    [
                    "solutionInformation",
                  ]
                  );
                
                if( !projectDetails.length > 0 ) {
                    
                    return resolve({
                        message : "reports generated successfully",
                        result : []
                    })
                }

                let categoriesInfo = { };
                let tasksReport = { };
                let projectReport = { 
                    "total": projectDetails.length,
                    "completed" :0,
                    "inProgress" : 0,
                    "notStarted" : 0,
                    "overdue" : 0,
                };
                await Promise.all(projectDetails.map( async function(project){

                    if(project.status=="completed"){

                        projectReport['completed'] = projectReport['completed'] + 1;

                    } else if(project.status=="inProgress"){
                        
                        var todayDate = moment(project.endDate, "DD.MM.YYYY");
                        var endDate = moment().format();
                        if(todayDate.diff(endDate, 'days') < 1){
                            projectReport['overdue'] = projectReport['overdue'] + 1;
                        }else {
                            projectReport['inProgress'] = projectReport['inProgress'] + 1;
                        }
                        
                    } else if(project.status=="notStarted"){

                        var todayDate = moment(project.endDate, "DD.MM.YYYY");
                        var endDate = moment().format();
                        if(todayDate.diff(endDate, 'days') < 1){
                            projectReport['overdue'] = projectReport['overdue'] + 1;
                        }else {
                            projectReport['notStarted'] = projectReport['notStarted'] + 1;
                        }
                        
                    }


                    if(project.categories){
                        project.categories.map(category=>{
                            if(categoriesInfo[category.name]){
                                categoriesInfo[category.name] =  categoriesInfo[category.name] + 1;
                            } else {
                                categoriesInfo[category.name] =  1;
                            }
                             
                        });
                    }

                    if(project.taskReport){
                        let keys = Object.keys(project.taskReport);
                        keys.map(key=>{
                            if(tasksReport[key]){
                                tasksReport[key] = tasksReport[key] + project.taskReport[key];
                            }else {
                                tasksReport[key] = project.taskReport[key];
                            }
                        });
                    }

                    await Promise.all(project.tasks.map(task=>{
                        var todayDate = moment(task.endDate, "DD.MM.YYYY");
                        var endDate = moment().format();
                        if(todayDate.diff(endDate, 'days') < 1){
                            if(tasksReport['overdue']){
                                tasksReport['overdue'] = tasksReport['overdue'] + 1;
                            } else {
                                tasksReport['overdue'] =  1;
                            }
                        }
                    }));
                }));

                let response  = {
                    categories : categoriesInfo,
                    tasks : tasksReport,
                    projects: projectReport
                }
                return resolve({
                    message :  CONSTANTS.apiResponses.REPORTS_GENERATED,
                    result : response
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

}