/**
 * name : helper.js
 * author : Aman
 * created-date : 22-July-2020
 * Description : Project templates tasks helper functionality.
 */

/**
    * ProjectTemplateTasksHelper
    * @class
*/

// Dependencies
const projectTemplatesHelper = require(MODULES_BASE_PATH + "/project/templates/helper");
const kendraService = require(GENERICS_FILES_PATH + "/services/kendra");


module.exports = class ProjectTemplateTasksHelper {

    /**
     * Lists of tasks.
     * @method
     * @name taskDocuments
     * @param {Array} [filterData = "all"] - tasks filter query.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [skipFields = "none"] - field not to include
     * @returns {Array} Lists of tasks. 
     */
    
    static taskDocuments(
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
               
               let tasks = 
               await database.models.projectTemplateTasks.find(
                   queryObject, 
                   projection
               ).lean();
           
               return resolve(tasks);
           
           } catch (error) {
               return reject(error);
           }
       });
    }

    /**
     * Extract csv information.
     * @method
     * @name extractCsvInformation
     * @param {Array} csvData - csv data.
     * @param {String} projectTemplateId - project template id.
     * @returns {Array} Lists of tasks.
     */
    
    static extractCsvInformation(
        csvData,
        projectTemplateId
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let taskIds = [];
                let solutionIds = [];
                let systemId = false;

                csvData.forEach(data=>{
                    
                    let parsedData = UTILS.valueParser(data);

                    if( parsedData._SYSTEM_ID ) {
                        taskIds.push(parsedData._SYSTEM_ID);
                        systemId = true;
                    } else {
                        taskIds.push(parsedData.externalId);
                    }

                    if ( parsedData.solutionId && parsedData.solutionId !== "" ) {
                        solutionIds.push(parsedData.solutionId);
                    }
                });

                let tasks = {};

                if( taskIds.length > 0 ) {

                    let filterData = {};

                    if( systemId ) {
                        filterData = {
                            _id : { $in : taskIds }
                        }
                    } else {
                        filterData = {
                            externalId : { $in : taskIds }
                        }
                    }

                    let tasksData = await this.taskDocuments(
                        filterData,
                        ["_id","children","externalId","projectTemplateId","parentId"]
                    );

                    if( tasksData.length > 0 ) {
                        tasksData.forEach(task=> {
                            if( systemId ) {
                                tasks[task._id.toString()] = task;
                            } else {
                                tasks[task.externalId] = task;
                            }
                        });
                    }
                }

                let templateId = "";

                let projectTemplate = 
                await projectTemplatesHelper.templateDocument({
                    _id : projectTemplateId
                },["_id"]);

                if ( projectTemplate.length > 0 ) {
                    templateId = projectTemplate[0]._id;
                } else {
                    throw {
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND
                    }
                }

                let solutionData = {};

                if ( solutionIds.length > 0 ) {
                    
                    let solutions = 
                    await kendraService.solutionDocuments({
                        _id : { $in : solutionIds }
                    },["externalId"]);

                    if ( Object.keys(solutions.result).length > 0 ) {
                        solutionData = solutions.result;
                    }
                }

                return resolve({
                    tasks : tasks,
                    templateId : templateId,
                    solutionData : solutionData
                });

           } catch (error) {
               return reject(error);
           }
       });
    }

    /**
     * Create a task.
     * @method
     * @name createOrUpdateTask
     * @param {Object} data - task data.
     * @param {String} templateId - template task id
     * @param {Object} solutionData - solution data
     * @param {String} [update = false]
     * @returns {Array} Create or update a task. 
     */
    
    static createOrUpdateTask( 
        data,
        templateId,
        solutionData,
        update = false
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let parsedData = UTILS.valueParser(data);

                let allValues = {};
                allValues.type = parsedData.type.toLowerCase(); 

                if ( allValues.type === CONSTANTS.common.ASSESSMENT ) {

                    allValues.assessmentDetails = {};

                    if( parsedData.assessmentType && parsedData.assessmentType !== "" ) {
                        allValues.assessmentDetails.type = parsedData.assessmentType; 
                    } else {
                        parsedData.STATUS = 
                        CONSTANTS.apiResponses.REQUIRED_ASSESSMENT_TYPE;
                    }
                    
                    if ( parsedData.assessmentSubType && parsedData.assessmentSubType !== "" ) {
                        allValues.assessmentDetails.subType = parsedData.assessmentSubType;
                    } else {
                        parsedData.STATUS = 
                        CONSTANTS.apiResponses.REQUIRED_ASSESSMENT_SUB_TYPE;
                    }

                    if ( parsedData.solutionId && parsedData.solutionId !== "" ) {

                        if ( !solutionData[parsedData.solutionId] ) {
                            parsedData.STATUS = 
                            CONSTANTS.apiResponses.SOLUTION_NOT_FOUND;
                        } else {
                            allValues.assessmentDetails.solutionId = 
                            ObjectId(solutionData[parsedData.solutionId]);
                        }

                    } else {
                        parsedData.STATUS = 
                        CONSTANTS.apiResponses.REQUIRED_SOLUTION_ID;
                    }

                } else if ( allValues.type === CONSTANTS.common.CONTENT ) {
                    allValues.contentDetails = {};

                    if( parsedData.contentId && parsedData.contentId !== "" ) {
                        allValues.contentDetails["contentId"] = ObjectId(parsedData.contentId);
                    } else {
                        parsedData.STATUS = CONSTANTS.apiResponses.REQUIRED_CONTENT_ID;
                    }

                    if( parsedData.contentType && parsedData.contentType !== "" ) {
                        allValues.contentDetails["contentType"] = 
                        parsedData.contentType;
                    } else {
                        parsedData.STATUS = 
                        CONSTANTS.apiResponses.REQUIRED_CONTENT_TYPE;
                    }

                } else if ( allValues.type === CONSTANTS.common.IMPROVEMENT_PROJECT ) {   
                    parsedData.improvementProjectDetails = {};

                    if ( 
                        parsedData.improvementProjectId && 
                        parsedData.improvementProjectId !== "" 
                    ) {
                        allValues.improvementProjectDetails.improvementProjectId = 
                        parsedData.improvementProjectId;

                    } else {
                        parsedData.STATUS = 
                        CONSTANTS.apiResponses.REQUIRED_IMPROVEMENT_PROJECT_ID;
                    }
                } else if ( allValues.type === CONSTANTS.common.MULTIPLE ) {
                    allValues.children = [];
                }

                allValues.projectTemplateId = templateId;

                let templateTaskSchema = schemas["project-template-tasks"].schema;

                let templateTasksData = Object.keys(templateTaskSchema);
                let booleanData = UTILS.getAllBooleanDataFromModels(templateTaskSchema);

                Object.keys(parsedData).forEach(eachParsedData=>{
                    if( 
                        templateTasksData.includes(eachParsedData) && 
                        !allValues[eachParsedData] 
                    ) {
                        if( booleanData.includes(eachParsedData) ) {
                            allValues[eachParsedData] = 
                            UTILS.convertStringToBoolean(parsedData[eachParsedData]);
                        } else {
                            allValues[eachParsedData] = parsedData[eachParsedData]; 
                        }
                    }
                });

                if( !parsedData.STATUS ) {

                    let taskData = {};

                    if( !update ) {
                    
                        taskData = 
                        await database.models.projectTemplateTasks.create(allValues);
    
                        if ( !taskData._id ) {
                            parsedData.STATUS = CONSTANTS.apiResponses.PROJECT_TEMPLATE_TASKS_NOT_CREATED;
                        } else {
                            parsedData._SYSTEM_ID = taskData._id;
                            parsedData.STATUS = CONSTANTS.apiResponses.SUCCESS;
                        }
    
                    } else {
                        
                        taskData = 
                        await database.models.projectTemplateTasks.findOneAndUpdate({
                            _id :  parsedData._SYSTEM_ID
                        },{
                            $set : allValues
                        });

                        parsedData.STATUS = CONSTANTS.apiResponses.SUCCESS;
                    }
    
                    if( taskData._id ) {
                            
                        if( parsedData.hasAParentTask === "YES" ) { 
                    
                            let parentTask =
                            await database.models.projectTemplateTasks.findOneAndUpdate({
                                externalId : parsedData.parentTaskId
                            },{
                                $addToSet : {
                                    children : taskData._id
                                }  
                            },{
                                returnOriginal : true
                            });

                            if( parentTask._id ) {
                                
                                let visibleIf = [];
                                
                                let operator = 
                                parsedData["parentTaskOperator"] === "EQUALS" ? 
                                "===" : parsedData["parentQuestionOperator"];
                                
                                visibleIf.push({
                                    operator : operator,
                                    _id : parentTask._id,
                                    value : parsedData.parentTaskValue
                                });
                                
                                await database.models.projectTemplateTasks.findOneAndUpdate({
                                    _id : taskData._id
                                },{
                                    $set : {
                                        parentId : parentTask._id,
                                        visibleIf : visibleIf
                                    }
                                });

                                if( update ) {
                                    parsedData._parentTaskId = parentTask._id;
                                }
                            }
                        }
    
                        await database.models.projectTemplates.findOneAndUpdate({
                            _id : templateId
                        },{
                            $addToSet : { tasks : ObjectId(taskData._id) }
                        });
                    }
                }

                return resolve(
                    _.omit(parsedData,["createdBy","updatedBy"])
                );
           
           } catch (error) {
               return reject(error);
           }
       });
    }

    /**
      * Bulk create project template tasks.
      * @method
      * @name bulkCreate
      * @param {Array} tasks - csv tasks data.
      * @param {String} projectTemplateId - project template id.
      * @param {String} userId - user logged in id.
      * @returns {Object} Bulk create project template tasks.
     */

    static bulkCreate( tasks,projectTemplateId,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                const fileName = `create-project-template-tasks`;
                let fileStream = new CSV_FILE_STREAM(fileName);
                let input = fileStream.initStream();
      
                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let csvData = 
                await this.extractCsvInformation(
                    tasks,
                    projectTemplateId
                );

                let pendingItems = [];

                for ( let task = 0; task < tasks.length ; task ++ ) {
                    let currentData = UTILS.valueParser(tasks[task]);
                    currentData.createdBy = currentData.updatedBy = userId;

                    if( 
                        currentData["hasAParentTask"] === "YES" &&
                        !csvData.tasks[currentData.parentTaskId]
                    ) {
                        pendingItems.push(currentData);
                    } else {
                        
                        if( csvData.tasks[currentData.externalId] ) {
                            currentData._SYSTEM_ID = CONSTANTS.apiResponses.PROJECT_TEMPLATE_TASK_EXISTS;
                            input.push(currentData);
                        } else {
                            
                            let createdTask = 
                            await this.createOrUpdateTask(
                                currentData,
                                csvData.templateId,
                                csvData.solutionData  
                            );

                            input.push(createdTask);
                        }
                    }
                }

                if ( pendingItems && pendingItems.length > 0 ) {
                    
                    for ( let item = 0; item < pendingItems.length ; item ++ ) {
                        
                        let currentData = pendingItems[item];
                        currentData.createdBy = currentData.updatedBy = userId;

                        if( csvData.tasks[currentData.externalId] ) {
                            currentData._SYSTEM_ID = CONSTANTS.apiResponses.PROJECT_TEMPLATE_TASK_EXISTS;
                            input.push(currentData);
                        } else {
                            
                            let createdTask = await this.createOrUpdateTask(
                                currentData,
                                csvData.templateId,
                                csvData.solutionData
                            );

                            input.push(createdTask);
                        }

                    }
                }

                input.push(null);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Bulk update project template tasks.
      * @method
      * @name bulkUpdate
      * @param {Array} tasks - csv tasks data.
      * @param {String} projectTemplateId - project template id.
      * @param {String} userId - user logged in id.
      * @returns {Object} Bulk update project template tasks.
     */

    static bulkUpdate( tasks,projectTemplateId,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                const fileName = `update-project-template-tasks`;
                let fileStream = new CSV_FILE_STREAM(fileName);
                let input = fileStream.initStream();
      
                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let csvData = 
                await this.extractCsvInformation(
                    tasks,
                    projectTemplateId
                );

                let tasksData =  Object.values(csvData.tasks);

                if ( csvData.tasks && tasksData.length > 0 ) {

                    tasksData.forEach(task=>{
                        if ( task.children && task.children.length > 0 ) {
                            task.children.forEach(children=>{
                                if( csvData.tasks[children.toString()] ) {
                                    csvData.tasks[children.toString()].parentTaskId = task._id.toString();
                                }
                            })
                        }
                    })
                }

                for ( let task = 0; task < tasks.length ; task ++ ) { 
                    
                    let currentData = UTILS.valueParser(tasks[task]);

                    if ( 
                        !currentData._SYSTEM_ID || 
                        !currentData._SYSTEM_ID === "" || 
                        !csvData.tasks[currentData["_SYSTEM_ID"]] 
                    ) {
                        currentData.STATUS = 
                        CONSTANTS.apiResponses.INVALID_TASK_ID;
                        input.push(currentData);
                        continue;
                    }

                    currentData.updatedBy = userId;
                    
                    let createdTask = 
                    await this.createOrUpdateTask(
                        _.omit(currentData,["STATUS"]),
                        csvData.templateId,
                        csvData.solutionData,
                        true  
                    );

                    if( 
                        csvData.tasks[currentData._SYSTEM_ID].parentId && 
                        csvData.tasks[currentData._SYSTEM_ID].parentId.toString() !== createdTask._parentTaskId.toString()
                    ) {

                        await database.models.projectTemplateTasks.findOneAndUpdate(
                            {
                              _id: csvData.tasks[currentData._SYSTEM_ID].parentId                            },
                            {
                              $pull: { children : ObjectId(currentData._SYSTEM_ID) }
                            }
                          );

                    }

                    input.push(createdTask);
                }

                input.push(null);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
     * Tasks and sub tasks.
     * @method
     * @name tasksAndSubTasks
     * @param {Array} templateId - Template id.
     * @returns {Array} Tasks and sub task.
     */
    
    static tasksAndSubTasks(templateId) {
        return new Promise(async (resolve, reject) => {
            try {

                const templateDocument = 
                await projectTemplatesHelper.templateDocument({
                    _id : templateId
                },["tasks"]);

                let tasks = [];

                if( templateDocument[0].tasks ) {
                    
                    tasks = await this.taskDocuments({
                        _id : {
                            $in : templateDocument[0].tasks
                        }
                    },"all",["projectTemplateId","__v"]);

                    for( let task = 0 ; task < tasks.length ; task ++ ) {

                        if( tasks[task].children && tasks[task].children.length > 0 ) {
                            
                            let subTasks = await this.taskDocuments({
                                _id : {
                                    $in : tasks[task].children
                                }
                            });
                            
                            tasks[task].children = subTasks;
                        }
                    }
                }

                return resolve(tasks);

           } catch (error) {
               return reject(error);
           }
       });
    }

};


