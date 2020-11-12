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
    * @param {String} userId - Logged in user id.
    * @param {String} reportType - report type monthly or quterly.
    * @param {String} programId - program id
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
                if(reportType==0){
                     let today = moment();
                     startFrom = today.startOf('week').format('YYYY-MM-DD');
                     endOf = today.endOf('week').format('YYYY-MM-DD');
                }
                else if (reportType == 1) {
                    endOf = moment().subtract(0, 'months').endOf('month').format('YYYY-MM-DD');
                    startFrom = moment().subtract(0, 'months').startOf('month').format('YYYY-MM-DD');
                } else if (reportType == 3) {
                     startFrom = moment().quarter(moment().quarter()).startOf('quarter').format('YYYY-MM-DD');
                     endOf = moment().quarter(moment().quarter()).endOf('quarter').format('YYYY-MM-DD');
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

                    if (project.status == CONSTANTS.common.COMPLETED_STATUS) {

                        projectReport[CONSTANTS.common.COMPLETED_STATUS] = projectReport[CONSTANTS.common.COMPLETED_STATUS] + 1;

                    } else if (project.status == CONSTANTS.common.INPROGRESS_STATUS) {

                        var todayDate = moment(project.endDate, "DD.MM.YYYY");
                        var endDate = moment().format();
                        if (todayDate.diff(endDate, 'days') < 1) {
                            projectReport['overdue'] = projectReport['overdue'] + 1;
                        } else {
                            projectReport[CONSTANTS.common.INPROGRESS_STATUS] = projectReport[CONSTANTS.common.INPROGRESS_STATUS] + 1;
                        }

                    } else if (project.status == CONSTANTS.common.NOT_STARTED_STATUS) {

                        var todayDate = moment(project.endDate, "DD.MM.YYYY");
                        var endDate = moment().format();
                        if (todayDate.diff(endDate, 'days') < 1) {
                            projectReport['overdue'] = projectReport['overdue'] + 1;
                        } else {
                            projectReport[CONSTANTS.common.NOT_STARTED_STATUS] = projectReport[CONSTANTS.common.NOT_STARTED_STATUS] + 1;
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

                if (projectReport[CONSTANTS.common.INPROGRESS_STATUS]) {
                    projectReport['onGoing'] = projectReport[CONSTANTS.common.INPROGRESS_STATUS];
                    delete projectReport['inProgress'];
                }

                if (tasksReport[CONSTANTS.common.INPROGRESS_STATUS]) {
                    tasksReport['onGoing'] = tasksReport[CONSTANTS.common.INPROGRESS_STATUS];
                    delete tasksReport[CONSTANTS.common.INPROGRESS_STATUS];
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

                let reportTypes = [
                    {
                        label: "Weekly",
                        value: 0
                    },
                    {
                        label: "Monthly",
                        value: 1
                    }, {
                        label: "Quarterly",
                        value: 3
                    }]
                resolve({ result: reportTypes, message: CONSTANTS.apiResponses.REPORT_TYPES_FOUND });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * Detail view Report.
    * @method
    * @name detailView 
    * @param {String} entityId - mapped entity id.
    * @param {String} userId - Logged in user id.
    * @param {String} reportType - report type monthly or quterly.
    * @param {String} programId - program id
    * @returns {Object} - response consist of chart report data
   */

    static detailView(entityId="",userId,reportType,programId) {
        return new Promise(async (resolve, reject) => {
            try {

                let query = {
                    isDeleted: { $ne:true }
                };

                if (entityId) {
                    query["entityInformation._id"] = mongoose.Types.ObjectId(entityId);
                } else {
                    query["userId"] = userId
                }

              
                let chartObject = [];
                
                var endOf = "";
                var startFrom = "";
                if(reportType==0){
                    let today = moment();
                    startFrom = today.startOf('week').format('YYYY-MM-DD');
                    endOf = today.endOf('week').format('YYYY-MM-DD');
               }
               else if (reportType == 1) {
                   endOf = moment().subtract(0, 'months').endOf('month').format('YYYY-MM-DD');
                   startFrom = moment().subtract(0, 'months').startOf('month').format('YYYY-MM-DD');
               } else if (reportType == 3) {
                    startFrom = moment().quarter(moment().quarter()).startOf('quarter').format('YYYY-MM-DD');
                    endOf = moment().quarter(moment().quarter()).endOf('quarter').format('YYYY-MM-DD');
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
                    ["title","taskReport", "status", "tasks", "categories"],
                    []
                );

                if (!projectDetails.length > 0) {

                    return resolve({
                        message: CONSTANTS.apiResponses.REPORTS_DATA_NOT_FOUND,
                        result: []
                    })
                }
    
                    await Promise.all(
                        projectDetails.map(async projectList => {
                         
                           
                            let reponseObj = {
                                title: {
                                    text: projectList.title
                                },
                                series: [{
                                    name: projectList.title,
                                    data: []
                                }],
                                xAxis: {
    
                                }
                            };
                            reponseObj.series[0].data = [];
                            reponseObj.xAxis.min = "";
                            reponseObj.xAxis.max = "";
                            reponseObj.series[0].name = projectList.title;
                            if (projectList.tasks && projectList.tasks.length > 0) {  
                                await Promise.all(projectList.tasks.map(async taskList => {
                                    
                                    let status = taskList.status;
                                    
                                    if (reponseObj.xAxis.min != "" && reponseObj.xAxis.max != "") {
                                        if (moment(reponseObj.xAxis.min) > moment(taskList.startDate)) {
                                            reponseObj.xAxis.min = taskList.startDate;
                                        }
                                        if (moment(reponseObj.xAxis.max) > moment(taskList.endDate)) { } else {
                                            reponseObj.xAxis.max = taskList.endDate;
                                        }
                                    } else {
                                        reponseObj.xAxis.min = taskList.startDate;
                                        reponseObj.xAxis.max = taskList.endDate;
                                    }
                                   
                                    let color = "";
                                    if (status == CONSTANTS.common.NOT_STARTED_STATUS) {
                                        color = "#f5f5f5";
                                    } else if (status == CONSTANTS.common.COMPLETED_STATUS) {
                                        color = "#20ba8d";
                                    } else if (status == CONSTANTS.common.INPROGRESS_STATUS) {
                                        color = "#ef8c2b";
                                    }
                                    let obj = {
                                        name: taskList.name,
                                        id: taskList._id,
                                        color: color,
                                        start: moment.utc(taskList.startDate).valueOf(),
                                        end: moment.utc(taskList.endDate).valueOf()
                                    }
    
                                    reponseObj.xAxis.min = moment.utc(reponseObj.xAxis.min).valueOf('YYYY,mm,DD');
                                    reponseObj.xAxis.max = moment.utc(reponseObj.xAxis.max).valueOf('YYYY,mm,DD');
                                    reponseObj.series[0].data.push(obj);
                                })
                                )
                                chartObject.push(reponseObj);
                            }
                        })
                    )
                    resolve({ message: CONSTANTS.apiResponses.REPORT_GENERATED, result: chartObject })
               
            } catch (ex) {
                return reject(error);
            }
        }
        );
    }
    
}