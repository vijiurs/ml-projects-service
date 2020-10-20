/**
 * name : helper.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Projects helper functionality.
 */

 // Dependencies

 const kendraService = require(GENERICS_FILES_PATH + "/services/kendra");
 const libraryCategoriesHelper = require(MODULES_BASE_PATH + "/library/categories/helper");
 const projectTemplatesHelper = require(MODULES_BASE_PATH + "/project/templates/helper");
 const projectTemplateTasksHelper = require(MODULES_BASE_PATH + "/project/templateTasks/helper");
 const {v4: uuidv4 } = require('uuid');

/**
    * UserProjectsHelper
    * @class
*/

module.exports = class UserProjectsHelper {

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
                        "createdBy",
                        "updatedBy",
                        "rootOrganisations",
                        "taskReport",
                        "createdFor",
                        "projectTemplateId",
                        "projectTemplateExternalId",
                        "__v"
                    ]
                );

                if( !projects.length > 0 ) {
                    
                    return resolve({
                        message : CONSTANTS.apiResponses.PROJECT_NOT_FOUND,
                        result : []
                    })
                }

                let projectIds = [];

                for( let project = 0 ; project < projects.length ; project ++) {
                    let currentProject = projects[project];
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

                    projectIds.push(currentProject._id);

                    delete currentProject.metaInformation;
                }

                await database.models.projects.updateMany({
                    _id : { $in : projectIds }
                },{
                    $set : {
                        lastDownloadedAt : new Date()
                    }
                })

                return resolve({
                    message : CONSTANTS.apiResponses.PROJECTS_FETCHED,
                    result : projects
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

      /**
      * List of projects meta form.
      * @method
      * @name metaForm
      * @returns {Object} List of projects meta form.
     */

    static metaForm() {
        return new Promise(async (resolve, reject) => {
            try {
                
                let forms = 
                await kendraService.formsDocuments(
                    {
                        name : "projects"
                    },[
                        "value"
                    ]
                );

                if( !forms.success ) {

                    return resolve({
                        message : CONSTANTS.apiResponses.PROJECTS_FORM_NOT_FOUND,
                        result : []
                    });

                }

                let categoriesData = 
                await database.models.projectCategories.find({},
                    {
                        name : 1,
                        externalId : 1
                    }
                ).lean();

                categoriesData = categoriesData.map(category=>{
                    return {
                        label : category.name,
                        value : category.externalId 
                    };
                });

                categoriesData.push({
                    label : CONSTANTS.common.OTHERS,
                    value : CONSTANTS.common.OTHERS.toLowerCase()
                });

                let formsData = forms.data[0].value;

                formsData[formsData.length - 1].options = categoriesData;

                return resolve({
                    message : CONSTANTS.apiResponses.PROJECTS_METAFORM_FETCHED,
                    result : formsData
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * List of projects tasks meta form.
      * @method
      * @name tasksMetaForm
      * @returns {Object} List of projects tasks meta form.
     */

    static tasksMetaForm() {
        return new Promise(async (resolve, reject) => {
            try {
                
                let forms = 
                await kendraService.formsDocuments(
                    {
                        name : "projectTasks"
                    },[
                        "value"
                    ]
                );

                if( !forms.success ) {

                    return resolve({
                        message : CONSTANTS.apiResponses.PROJECT_TASKS_FORM_NOT_FOUND,
                        result : []
                    });

                }

                return resolve({
                    message : CONSTANTS.apiResponses.PROJECT_TASKS_METAFORM_FETCHED,
                    result : forms.data[0].value
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Bulk create user projects.
      * @method
      * @name bulkCreate - Bulk create user projects.
      * @param {Array} csvData - csv data.
      * @param {String} userId - logged in user id.
      * @param {String} userToken - logged in user token.
      * @returns {Object}  Bulk create user projects.
     */

    static bulkCreate( csvData,userId,userToken ) {
        return new Promise(async (resolve, reject) => {
            try {

                const fileName = `bulk-create-user-`;
                let fileStream = new CSV_FILE_STREAM(fileName);
                let input = fileStream.initStream();
      
                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let templateIds = [];
                let entityIds = [];

                csvData.forEach(data => {
                    
                    templateIds.push(data.templateId);
                    entityIds.push(data.entityId);

                });

                let entityDocument = {};

                if (entityIds.length > 0) {
                    const entitiesData = await _entitiesInformation(entityIds);
                    entityDocument = 
                    entitiesData.reduce((ac, entity) => ({ ...ac, [entity._id.toString()]: entity}), {});
                }

                let templateData = {};
                let solutionIds = [];
                let programIds = [];

                if( templateIds.length > 0 ) {
                    
                    const projectTemplates = 
                    await projectTemplatesHelper.templateDocument({
                        externalId : {
                            $in : templateIds
                        },
                        isReusable : false
                    },"all",
                    [
                        "ratings",
                        "noOfRatings",
                        "averageRating"
                    ]);

                    if( projectTemplates.length > 0 ) {
                        
                        projectTemplates.forEach(template => {
                            
                            templateData[template.externalId] = template;
                            
                            if( template.solutionId ) {
                                solutionIds.push(template.solutionId);
                            }

                            if( template.programId ) {
                                programIds.push(template.programId);
                            }

                        })
                    }
                }

                let solutions = {};

                if( solutionIds.length > 0 ) {

                    let solutionData = 
                    await kendraService.solutionDocuments({
                        _id : {
                            $in : solutionIds
                        }
                    },"all",[
                        "levelToScoreMapping",
                        "scoringSystem",
                        "themes",
                        "flattenedThemes",
                        "questionSequenceByEcm",
                        "entityProfileFieldsPerEntityTypes",
                        "evidenceMethods",
                        "sections",
                        "noOfRatingLevels",
                        "roles",
                        "captureGpsLocationAtQuestionLevel",
                        "enableQuestionReadOut"
                    ]);

                    if( 
                        solutionData.success && 
                        solutionData.data && solutionData.data.length > 0 
                    ) {
                        
                        solutionData.data.forEach(solution => {
                            solutions[solution.externalId] = solution;
                        })
                    }

                }

                let programs = {};

                if( programIds.length > 0 ) {

                    let programData = 
                    await kendraService.programsDocuments({
                        _id : {
                            $in : programIds
                        }
                    },"all",["components"]);

                    if( programData.success && programData.data.length > 0 ) {
                        
                        programData.data.forEach(program => {
                            programs[program.externalId] = program;
                        })
                    }
                }

                for ( 
                    let pointerToCsvData = 0; 
                    pointerToCsvData < csvData.length ; 
                    pointerToCsvData ++ 
                ) {

                    let currentCsvData = csvData[pointerToCsvData];

                    if( !templateData[currentCsvData.templateId] ) {
                        currentCsvData["STATUS"] = 
                        CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND;
                        continue;
                    }

                    let currentTemplateData = 
                    templateData[csvData[pointerToCsvData].templateId];

                    currentTemplateData.userId = csvData[pointerToCsvData]["keycloak-userId"];
                    currentTemplateData.createdBy = userId;
                    currentTemplateData.updatedBy = userId;

                    if( 
                        currentTemplateData && 
                        currentTemplateData.tasks && 
                        currentTemplateData.tasks.length > 0 
                    ) {
                        
                        const tasksAndSubTasks = 
                        await projectTemplateTasksHelper.tasksAndSubTasks(
                            currentTemplateData._id
                        );

                        currentTemplateData.tasks = _projectTask(tasksAndSubTasks);
                    }

                    let solutionInformation = {};

                    if ( currentTemplateData.solutionExternalId ) {

                        if( !solutions[currentTemplateData.solutionExternalId] ) {
                            currentCsvData["STATUS"] = 
                            CONSTANTS.apiResponses.SOLUTION_NOT_FOUND;
                            continue;
                        }

                        solutionInformation = solutions[currentTemplateData.solutionExternalId];
                        currentTemplateData.solutionInformation = 
                        _.omit(
                            solutionInformation,
                            ["entities","programId","programExternalId"]
                        );

                        currentTemplateData.createdFor = solutionInformation.createdFor;
                        currentTemplateData.rootOrganisations = solutionInformation.rootOrganisations;

                        delete currentTemplateData.solutionId;
                        delete currentTemplateData.solutionExternalId;
                    }

                    if( currentTemplateData.programExternalId ) {

                        if( !programs[currentTemplateData.programExternalId] ) {
                            currentCsvData["STATUS"] = 
                            CONSTANTS.apiResponses.PROGRAM_NOT_FOUND;
                            continue;
                        }

                        currentTemplateData.programInformation = 
                        programs[currentTemplateData.programExternalId];

                        delete currentTemplateData.programId;
                        delete currentTemplateData.programExternalId;
                    }

                    if( entityDocument[csvData[pointerToCsvData].entityId] ) {
                        
                        let entities = [];

                        if( 
                            solutionInformation.entities && 
                            solutionInformation.entities.length > 0 
                        ) {
                            let entityIndex = 
                            solutionInformation.entities.findIndex(entity => entity._id === csvData[pointerToCsvData].entityId);

                            if( entityIndex < 0 ) {
                                entities = 
                                solutionInformation.entities.push(ObjectId(csvData[pointerToCsvData].entityId))
                            }
                        } else {
                            entities = [ObjectId(csvData[pointerToCsvData].entityId)];
                        }

                        if( entities.length > 0 ) {
                            await kendraService.updateSolution(
                                userToken,
                                {
                                    entities : entities
                                },
                                solutionInformation.externalId
                            )
                        }

                        currentTemplateData.entityInformation = 
                        entityDocument[csvData[pointerToCsvData].entityId];

                        delete currentTemplateData.entityType;
                        delete currentTemplateData.entityTypeId;
                    }

                    const projectCreation = 
                    await database.models.projects.create(currentTemplateData);

                    currentCsvData["STATUS"] = projectCreation._id;

                    input.push(currentCsvData);
                }

                input.push(null);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Projects boolean data.
      * @method
      * @name booleanData     
      * @returns {Array} Boolean data.
    */

    static booleanData() {
        
        const projectsSchema = schemas["projects"].schema;
        const projectSchemaKey = Object.keys(projectsSchema);

        let booleanProjects = []; 
    
        projectSchemaKey.forEach(projectSchema => {
            const currentSchema = projectsSchema[projectSchema];

            if( 
                currentSchema.hasOwnProperty('default') && 
                typeof currentSchema.default === "boolean" 
            ) {
                booleanProjects.push(projectSchema);
            }
        });

        return booleanProjects;
    }

    /**
      * Projects object id field.
      * @method
      * @name mongooseIdData     
      * @returns {Array} Projects object id field.
    */

    static mongooseIdData() {
        
        const projectsSchema = schemas["projects"].schema;
        const projectSchemaKey = Object.keys(projectsSchema);

        let mongooseIds = []; 
    
        projectSchemaKey.forEach(projectSchema=>{

            const currentSchemaType = projectsSchema[projectSchema];

            if( currentSchemaType === "ObjectId" ) {
                mongooseIds.push(projectSchema);
            }
        });

        return mongooseIds;
    }

    /**
      * Sync project.
      * @method
      * @name importFromLibrary 
      * @param {String} projectTemplateId - project template id.
      * @param {Object} requestedData - body data.
      * @param {String} userId - Logged in user id.
      * @param {String} userToken - User token.
      * @returns {Object} Project created information.
     */

    static importFromLibrary( projectTemplateId,requestedData,userToken,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                let libraryProjects = 
                await libraryCategoriesHelper.projectDetails(
                    projectTemplateId
                );

                if( 
                    libraryProjects.result && 
                    !Object.keys(libraryProjects.result).length > 0 
                ) {
                    return resolve({
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND,
                        result : {}
                    });
                }

                if( libraryProjects.result.tasks && libraryProjects.result.tasks.length > 0 ) {
                    
                    libraryProjects.result.tasks = await _projectTask(
                        libraryProjects.result.tasks,
                        true,
                        {}
                    );
                }

                let programAndSolutionInformation = 
                await this.createProgramAndSolution(
                    requestedData.entityId,
                    requestedData.programId,
                    requestedData.programName,
                    userToken
                );

                if( !programAndSolutionInformation.success ) {
                    return resolve(programAndSolutionInformation);
                }
                
                libraryProjects.result.userId = libraryProjects.result.updatedBy = libraryProjects.result.createdBy = userId;

                let projectCreation = await database.models.projects.create(
                    _.merge(
                        _.omit(libraryProjects.result,["_id"]),
                        programAndSolutionInformation.result
                    )
                );

                if( requestedData.rating && requestedData.rating > 0 ) {
                    await projectTemplatesHelper.ratings(
                        projectTemplateId,
                        requestedData.rating,
                        userToken
                    );
                }

                projectCreation = _projectInformation(projectCreation._doc);

                return resolve({
                    message : CONSTANTS.apiResponses.PROJECTS_FETCHED,
                    result : projectCreation
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Create user projects.
      * @method
      * @name create 
      * @param userId - Logged in user id.
      * @param userToken - Logged in user token.
      * @returns {Object} Return _id and lastDownloadedAt 
     */

    static create( userId,userToken ) {
        return new Promise(async (resolve, reject) => {
            try {

                let creationData = {
                    lastDownloadedAt : new Date(),
                    createdFor : [],
                    rootOrganisations : []
                }

                creationData["userId"] = creationData["createdBy"] = creationData["updatedBy"] = userId;

                let userOrganisations = 
                await kendraService.getUserOrganisationsAndRootOrganisations(
                    userToken
                );

                if( userOrganisations.success ) {
                    creationData.createdFor = userOrganisations.data.createdFor;
                    creationData.rootOrganisations = userOrganisations.data.rootOrganisations;
                }

                let userProject = await database.models.projects.create(
                    creationData
                );

                return resolve({
                    message : CONSTANTS.apiResponses.CREATED_USER_PROJECT,
                    result : _.pick(userProject,["_id","lastDownloadedAt"])
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Sync project.
      * @method
      * @name sync 
      * @param {String} projectId - id of the project.
      * @param {String} lastDownloadedAt - last downloaded at time.
      * @param {Object} data - body data.
      * @param {String} userId - Logged in user id.
      * @param {String} userToken - User token.
      * @returns {Object} Project created information.
    */

    static sync( projectId,lastDownloadedAt,data,userId,userToken ) {
        return new Promise(async (resolve, reject) => {
            try {

                const userProject = await this.projectDocument({
                    _id : projectId,
                    userId : userId,
                    lastDownloadedAt : lastDownloadedAt
                },["_id","tasks"]);

                if ( !userProject.length > 0 ) {
                    
                    return resolve({
                        message : CONSTANTS.apiResponses.USER_PROJECT_NOT_FOUND,
                        result : {}
                    });
                }

                const projectsModel = Object.keys(schemas["projects"].schema);

                let updateProject = {};

                if( data.categories && data.categories.length > 0 ) {
                    updateProject.categories = 
                    await _projectCategories(data.categories);
                }

                if( data.startDate ) {
                    updateProject["startDate"] = data.startDate;
                }

                if( data.endDate ) {
                    updateProject["endDate"] = data.endDate;
                }

                if( 
                    (data.programId && data.programId !== "") || 
                    ( data.programName && data.programName !== "" ) 
                ) {

                    let programAndSolutionInformation = 
                    await this.createProgramAndSolution(
                        data.entityId,
                        data.programId,
                        data.programName,
                        userToken
                    );
    
                    if( !programAndSolutionInformation.success ) {
                        return resolve(programAndSolutionInformation);
                    }

                    updateProject = 
                    _.merge(updateProject,programAndSolutionInformation.result);
                }

                let booleanData = this.booleanData(schemas["projects"].schema);
                let mongooseIdData = this.mongooseIdData(schemas["projects"].schema);

                if( data.tasks ) {  

                    let taskReport = {};
                    
                    updateProject.tasks = await _projectTask(
                        data.tasks,
                        userId
                    );

                    if( 
                        userProject[0].tasks && 
                        userProject[0].tasks.length > 0 
                    ) {

                        updateProject.tasks.forEach(task => {
    
                            task.updatedBy = userId;
                            task.updatedAt = new Date();
                            
                            let taskIndex = 
                            userProject[0].tasks.findIndex(
                                projectTask => projectTask._id === task._id 
                            );
                            
                            if( taskIndex < 0 ) {
                                userProject[0].tasks.push(
                                    task
                                );
                            } else {
                                userProject[0].tasks[taskIndex] = task;
                            }
                        });
    
                        updateProject.tasks = userProject[0].tasks;
                    }

                    taskReport.total = updateProject.tasks.length;

                    updateProject.tasks.forEach(task => {
                        if( !taskReport[task.status] ) {
                            taskReport[task.status] = 1; 
                        } else {
                            taskReport[task.status] += 1; 
                        }
                    });

                    updateProject["taskReport"] = taskReport;
                }

                Object.keys(data).forEach(updateData => {
                    if ( 
                        !updateProject[updateData] && 
                        projectsModel.includes(updateData) 
                    ) {
                        
                        if ( booleanData.includes(updateData) ) {
                
                            updateProject[updateData] = 
                            UTILS.convertStringToBoolean(data[updateData]);
            
                        } else if( mongooseIdData.includes(updateData) ) {
                            updateProject[updateData] = ObjectId(data[updateData]);
                        } else {
                            updateProject[updateData] = data[updateData];
                        } 
                    }
                });

                updateProject.updatedBy = userId;

                if( data.resources ) {
                    updateProject.resources = data.resources;
                }

                let projectUpdated = 
                await database.models.projects.findOneAndUpdate(
                    {
                        _id : userProject[0]._id
                    },
                    {
                        $set : updateProject
                    },{
                        new : true
                    }
                );

                if( !projectUpdated._id ) {
                    return resolve({
                        message : CONSTANTS.apiResponses.USER_PROJECT_NOT_UPDATED
                    })
                }

                return resolve({
                    message : CONSTANTS.apiResponses.USER_PROJECT_UPDATED
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Program and solution information
      * @method
      * @name createProgramAndSolution 
      * @param {String} entityId - entity id.
      * @param {String} userToken - Logged in user token.
      * @param {String} [ programId = "" ] - Program Id.
      * @param {String} [ programName = "" ] - Program Name.
      * @returns {Object} Created program and solution data.
     */

    static createProgramAndSolution( 
        entityId = "",
        programId = "", 
        programName = "",
        userToken
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = {};

                if( entityId && entityId !== "" ) { 
                    let entitiesData = await _entitiesInformation(entityId);
                    result["entityInformation"] = entitiesData[0];
                }

                let programAndSolutionData = {
                    entities : 
                    result.entityInformation ? 
                    [ObjectId(result.entityInformation._id) ] : [],
                    type : CONSTANTS.common.IMPROVEMENT_PROJECT,
                    subType : CONSTANTS.common.IMPROVEMENT_PROJECT
                };

                // <- Dirty fix not required currently

                // if( programId == "" && programName == "" ) {
                    
                //     let privatePrograms = 
                //     await kendraService.userPrivatePrograms(userToken);

                //     if( !privatePrograms.success ) {
                //         return resolve({
                //             success : false,
                //             message : CONSTANTS.apiResponses.SOLUTION_PROGRAMS_NOT_CREATED,
                //             result : {}
                //         })
                //     }

                //     if( privatePrograms.data[0] && privatePrograms.data[0]._id ) {
                //         programAndSolutionData["programId"] = privatePrograms.data[0]._id;
                //     } else {
                //         programAndSolutionData["programName"] = "My Program"
                //     }
                // } else {
                    
                //     if( programName !== "" ) {

                //         programAndSolutionData["programName"] = programName;
                //     } 
                    
                //     if( programId !== "" ) {
                //         programAndSolutionData["programId"] = programId;
                //     } 
                // }


                if( programName !== "" ) {
                    programAndSolutionData["programName"] = programName;
                } 
                
                if( programId !== "" ) {
                    programAndSolutionData["programId"] = programId;
                } 

                let solutionAndProgramCreation = 
                await kendraService.createUserProgramAndSolution(
                    programAndSolutionData,
                    userToken
                );

                if( !solutionAndProgramCreation.success ) {
                    return resolve({
                        success : false,
                        message : CONSTANTS.apiResponses.SOLUTION_PROGRAMS_NOT_CREATED,
                        result : {}
                    })
                }
                
                result.solutionInformation =  _.omit(
                    solutionAndProgramCreation.data.solution,
                    ["__v"]
                );
                
                result.solutionInformation._id = 
                ObjectId(result.solutionInformation._id);

                result.programInformation =  _.omit(
                    solutionAndProgramCreation.data.program,
                    ["__v","components"]
                );
    
                result.programInformation._id = 
                ObjectId(result.programInformation._id);

                return resolve({
                    success : true,
                    result : result
                });

            } catch (error) {
                return reject(error);
            }
        });
    }

     /**
      * Project details.
      * @method
      * @name details 
      * @param {String} projectId - project id.
      * @returns {Object} 
     */

    static details( projectId,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                const projectDetails = await this.projectDocument({
                    _id : projectId,
                    userId : userId
                },"all",
                [
                    "taskReport",
                    "createdFor",
                    "rootOrganisations",
                    "projectTemplateId",
                    "projectTemplateExternalId",
                    "userId",
                    "createdBy",
                    "updatedBy",
                    "createdAt",
                    "updatedAt",
                    "__v"
                ]);

                if( !projectDetails.length > 0 ) {
                    
                    return resolve({
                        message : CONSTANTS.apiResponses.PROJECT_NOT_FOUND,
                        result : []
                    })
                }

                return resolve({
                    message : CONSTANTS.apiResponses.PROJECT_DETAILS_FETCHED,
                    result : projectDetails[0]
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

};

 /**
  * Project information.
  * @method
  * @name _projectInformation 
  * @param {Object} project - Project data.
  * @returns {Object} Project information.
*/

function _projectInformation(project) {
    
    project.entityInformation = _.pick(
        project.entityInformation,
        ["externalId","name","entityType","entityTpeId"]
    );

    project.solutionInformation = _.pick(
        project.solutionInformation,
        ["externalId","name"]
    );

    project.programInformation = _.pick(
        project.programInformation,
        ["externalId","name"]
    );

    if( project.metaInformation ) {
        Object.keys(project.metaInformation).forEach(projectMetaKey=>{
            project[projectMetaKey] = project.metaInformation[projectMetaKey];
        });
    }

    delete project.metaInformation;
    delete project.__v;

    return project;
}

/**
  * Task of project.
  * @method
  * @name _projectTask
  * @param {Array} tasks - tasks data.
  * @param {String} userId - logged in user id.
  * @returns {Object} Project task.
*/

function _projectTask(task) {

    task.forEach(singleTask => {

        singleTask.externalId = singleTask.externalId ? singleTask.externalId : singleTask.name.toLowerCase();
        singleTask.type = singleTask.type ? singleTask.type : CONSTANTS.common.SINGLE_TASK_TYPE;
        singleTask.status = singleTask.status ? singleTask.status : CONSTANTS.common.NOT_STARTED;
        singleTask.isDeleted = singleTask.isDeleted ? singleTask.isDeleted : false;
        singleTask.isDeleteable = singleTask.isDeleteable ? singleTask.isDeleteable : false;
        singleTask.createdAt = singleTask.createdAt ? singleTask.createdAt : new Date();
        singleTask.updatedAt = singleTask.updatedAt ? singleTask.updatedAt : new Date();
        singleTask._id = UTILS.isValidMongoId(singleTask._id.toString()) ? uuidv4() : singleTask._id;
        singleTask.isImportedFromLibrary = singleTask.isACustomTask;

        if( singleTask.startDate ) {
            singleTask.startDate = singleTask.startDate; 
        }

        if( singleTask.endDate ) {
            singleTask.endDate = singleTask.endDate; 
        }

        if( singleTask.children ) {
            _projectTask(singleTask.children);
        } else {
            singleTask.children = [];
        }

    })

    return task;
}

/**
  * Project categories information.
  * @method
  * @name _projectCategories 
  * @param {Array} categories - Categories data.
  * @returns {Object} Project categories information.
*/

function _projectCategories(categories) {
    return new Promise( async (resolve,reject)=>{
        try {

            const categoryIds = categories.map(category => {
                if( category.value && category.value !== "" ) {
                    return category.value;
                }
            });

            const categoryData = 
            await libraryCategoriesHelper.categoryDocuments({
                _id : { $in : categoryIds }
            },["name","externalId"]);

            let categoryInternalIdToData = {};

            if ( categoryData.length > 0 ) {
                
                categoryData.forEach(category=>{
                    categoryInternalIdToData[category._id.toString()] = category;
                });
            }

            const categoriesData = categories.map(category => { 
                let categoryData = {};

                if( 
                    category.value && 
                    category.value !== "" && 
                    categoryInternalIdToData[category.value] 
                ) {
                    categoryData = categoryInternalIdToData[category.value];
                } else {
                    categoryData = {
                        name : category.label,
                        externalId : "",
                        _id : ""
                    }
                }

                return categoryData;
            });

            return resolve(categoriesData);

        } catch(error) {
            return reject(error);
        }
    })
}

/**
  * Entities information for project.
  * @method
  * @name _entitiesInformation 
  * @param {String} entityIds - entity id.
  * @returns {Object} Project entity information.
*/

function _entitiesInformation(entityIds) {
    return new Promise( async (resolve,reject)=>{
        try {

            let entityData = 
            await kendraService.entityDocuments(
                {
                    _id : {
                        $in : entityIds
                    }
                },
                ["metaInformation","entityType","entityTypeId"]
            );

            let entitiesData = [];

            if( entityData.success && entityData.data.length > 0 ) {

                entitiesData = entityData.result.map(entity => {
                    entity.metaInformation._id = ObjectId(entity._id);
                    entity.metaInformation.entityType = entity.entityType;
                    entity.metaInformation.entityTypeId = ObjectId(entity.entityTypeId);
                    return entity.metaInformation;
                });
            }

            return resolve(entitiesData);

        } catch(error) {
            return reject(error);
        }
    })
}




