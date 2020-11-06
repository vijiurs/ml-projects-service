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
    * @param {String} programId - program id
    * @param {String} categories - array of categories
    * @returns {Object} Entity report.
   */
    static entity(entityId = "", userId, reportType, programId = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let query = {};

                if (entityId) {
                    query["entityInformation._id"] = mongoose.Types.ObjectId(entityId);
                } else {
                    query["userId"] = userId
                }

                var endOf = "";
                var startFrom = "";
                if (reportType == 3) {
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
                    { "lastSync": { $gte: new Date(startFrom), $lte: new Date(endOf) } },
                    { "tasks": { $elemMatch: { lastSync: { $gte: new Date(startFrom), $lte: new Date(endOf) } } } },
                ]

                if (programId) {
                    query['programInformation._id'] = mongoose.Types.ObjectId(programId);
                }

                const projectDetails = await UserProjectsHelper.projectDocument(
                    query,
                    ["taskReport", "status", "tasks", "categories"],
                    []
                );

                if (!projectDetails.length > 0) {

                    return resolve({
                        message: CONSTANTS.apiResponses.REPORTS_DATA_NOT_FOUND,
                        result: []
                    })
                }

                let tasksReport = {};
                let categories = {};
                let categoriesArray = [];
                let projectReport = {
                    "total": projectDetails.length,
                    "completed": 0,
                    "inProgress": 0,
                    "notStarted": 0,
                    "overdue": 0,
                };
                await Promise.all(projectDetails.map(async function (project) {

                    if (project.categories) {
                        project.categories.map(category => {
                            if (categoriesArray.includes(category.name)) {
                                categories[category.name] = categories[category.name] + 1;
                            } else {
                                categoriesArray.push(category.name);
                                categories[category.name] = 1;
                            }
                        });
                        categories['total'] = categoriesArray.length;
                    }
                  
                    if (project.status == "completed") {

                        projectReport['completed'] = projectReport['completed'] + 1;

                    } else if (project.status == "inProgress") {

                        var todayDate = moment(project.endDate, "DD.MM.YYYY");
                        var endDate = moment().format();
                        if (todayDate.diff(endDate, 'days') < 1) {
                            projectReport['overdue'] = projectReport['overdue'] + 1;
                        } else {
                            projectReport['inProgress'] = projectReport['inProgress'] + 1;
                        }

                    } else if (project.status == "notStarted") {

                        var todayDate = moment(project.endDate, "DD.MM.YYYY");
                        var endDate = moment().format();
                        if (todayDate.diff(endDate, 'days') < 1) {
                            projectReport['overdue'] = projectReport['overdue'] + 1;
                        } else {
                            projectReport['notStarted'] = projectReport['notStarted'] + 1;
                        }
                    }

                    

                    if (project.taskReport) {
                        let keys = Object.keys(project.taskReport);
                        keys.map(key => {
                            if (tasksReport[key]) {
                                tasksReport[key] = tasksReport[key] + project.taskReport[key];
                            } else {
                                tasksReport[key] = project.taskReport[key];
                            }
                        });
                    }

                    await Promise.all(project.tasks.map(task => {
                        var todayDate = moment(task.endDate, "DD.MM.YYYY");
                        var endDate = moment().format();
                        if (todayDate.diff(endDate, 'days') < 1) {
                            if (tasksReport['overdue']) {
                                tasksReport['overdue'] = tasksReport['overdue'] + 1;
                            } else {
                                tasksReport['overdue'] = 1;
                            }
                        }
                    }));


                }));

                if(projectReport['inProgress']){
                    projectReport['onGoing'] =  projectReport['inProgress'];
                    delete projectReport['inProgress'];
                }
                
                if(tasksReport['inProgress']){
                    tasksReport['onGoing'] =  tasksReport['inProgress'];
                    delete tasksReport['inProgress'];
                }

                let response = {
                    categories: categories,
                    tasks: tasksReport,
                    projects: projectReport
                }
                return resolve({
                    message: CONSTANTS.apiResponses.REPORTS_GENERATED,
                    result: response
                });

            } catch (error) {
                return reject(error);
            }
        })
    }


    /**
      * Get programs list.
      * @method
      * @name getProgramsByEntity 
      * @param {String} userId - Logged in user id.
      * @param {String} entityId - entity id.
      * @param {String} pageSize - Size of page.
      * @param {String} pageNo - Recent page no.
      * @param {String} search - search text.
      * @returns {Object} -  returns programs list
     */

    static getProgramsByEntity(userId, entityId, pageSize, pageNo, search) {
        return new Promise(async (resolve, reject) => {
            try {

                let query = {
                    "entityInformation._id": mongoose.Types.ObjectId(entityId),
                }

                let searchQuery = [];
                if (search !== "") {
                    searchQuery = [{ "programInformation.name": new RegExp(search, 'i') }];
                }

                const projectDocuments = await UserProjectsHelper.projects(
                    query,
                    pageSize,
                    pageNo,
                    searchQuery,
                    ["programInformation", "entityInformation", "userId"]
                );

                if (projectDocuments.result && projectDocuments.result.count == 0) {
                    return resolve({
                        message: CONSTANTS.apiResponses.PROGRAMS_NOT_FOUND,
                        result: []
                    })
                }

                let programs = [];
             
                let projectDetails = projectDocuments.result.data;
                for (let index = 0; index < projectDetails.length; index++) {
                    programs.push({
                        name: projectDetails[index].programInformation.name,
                        _id: projectDetails[index].programInformation._id
                    });
                }

                return resolve({
                    message: CONSTANTS.apiResponses.PROGRAMS_FOUND,
                    result: {
                        data: programs,
                        count: projectDocuments.result.count
                    }
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    

    /**
      * Get report types
      * @method
      * @name getTypes 
      * @returns {Object} - returns report types
     */

    static getTypes() {
        return new Promise(async (resolve, reject) => {
            try {

                let reportTypes = [{
                    label:"Last Month",
                    value: 1
                },{
                    label:"Last Quarter",
                    value: 3
                }]
                resolve({ result:reportTypes ,message:  CONSTANTS.apiResponses.REPORT_TYPES_FOUND } );

            } catch (error) {
                return reject(error);
            }
        })
    }
}