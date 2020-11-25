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
const { v4: uuidv4 } = require('uuid');
const assessmentService = require(GENERICS_FILES_PATH + "/services/assessment");

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

                if (skipFields !== "none") {
                    skipFields.forEach(field => {
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
                            userId: userId,
                            isDeleted : false
                        }, "all", [
                        "createdBy",
                        "updatedBy",
                        "rootOrganisations",
                        "taskReport",
                        "createdFor",
                        "projectTemplateId",
                        "projectTemplateExternalId",
                        "__v"
                    ]);

                if (!projects.length > 0) {

                    throw {
                        status : HTTP_STATUS_CODE['ok'].status,
                        message: CONSTANTS.apiResponses.PROJECT_NOT_FOUND
                    };
                }

                let projectIds = [];

                let updateLastDownloadedDate = new Date();

                for (let project = 0; project < projects.length; project++) {
                    let projectInformation = await _projectInformation(projects[project]);

                    if( !projectInformation.success ) {
                        return resolve(projectInformation);
                    }

                    projectInformation.data.lastDownloadedAt = updateLastDownloadedDate;
                    projectIds.push(projectInformation.data._id);
                }

                await database.models.projects.updateMany({
                    _id: { $in: projectIds }
                }, {
                    $set: {
                        lastDownloadedAt: updateLastDownloadedDate
                    }
                });

                return resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.PROJECTS_FETCHED,
                    data: projects
                });

            } catch (error) {
                return resolve({
                    status : error.status ? error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                    success: false,
                    message: error.message,
                    data: []
                });
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
                        name: "projects"
                    }, 
                    [
                        "value"
                    ]
                );

                if (!forms.success) {

                    throw {
                        status : HTTP_STATUS_CODE['ok'].status,
                        message: CONSTANTS.apiResponses.PROJECTS_FORM_NOT_FOUND
                    };

                }

                let categoriesData =
                await libraryCategoriesHelper.categoryDocuments({},["name","externalId"]);

                if ( !categoriesData.length > 0 ) {

                    throw {
                        status : HTTP_STATUS_CODE['bad_request'].status,
                        message: CONSTANTS.apiResponses.LIBRARY_CATEGORIES_NOT_FOUND
                    };

                }

                categoriesData = categoriesData.map(category => {
                    return {
                        _id: category._id,
                        label: category.name,
                        value: category.externalId
                    };
                });

                categoriesData.push({
                    _id: "",
                    label: CONSTANTS.common.OTHERS,
                    value: CONSTANTS.common.OTHERS.toLowerCase()
                });

                let formsData = forms.data[0].value;

                formsData[formsData.length - 1].options = categoriesData;

                return resolve({
                    success : true,
                    message : CONSTANTS.apiResponses.PROJECTS_METAFORM_FETCHED,
                    data : formsData
                });

            } catch (error) {
                return resolve({
                    status : 
                    error.status ? 
                    error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                    success : false,
                    message : error.message,
                    data : []
                });
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
                            name: "projectTasks"
                        }, [
                        "value"
                    ]
                    );

                if (!forms.success) {

                    throw {
                        status : HTTP_STATUS_CODE['ok'].status,
                        message : CONSTANTS.apiResponses.PROJECT_TASKS_FORM_NOT_FOUND
                    }

                }

                return resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.PROJECT_TASKS_METAFORM_FETCHED,
                    data: forms.data[0].value
                });

            } catch (error) {
                return resolve({
                    status : 
                    error.status ? 
                    error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                    success: false,
                    message: error.message,
                    data: []
                });
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

    static bulkCreate(csvData, userId, userToken) {
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

                    if( !entitiesData.success ) {
                        return resolve(entitiesData);
                    }

                    entityDocument =
                    entitiesData.data.reduce((ac, entity) => ({ ...ac, [entity._id.toString()]: entity }), {});
                }

                let templateData = {};
                let solutionIds = [];
                let programIds = [];

                if (templateIds.length > 0) {

                    const projectTemplates =
                    await projectTemplatesHelper.templateDocument({
                        externalId: {
                            $in: templateIds
                        },
                        isReusable: false
                    }, "all",
                    [
                        "ratings",
                        "noOfRatings",
                        "averageRating"
                    ]);

                    if (projectTemplates.length > 0) {

                        projectTemplates.forEach(template => {

                            templateData[template.externalId] = template;

                            if (template.solutionId) {
                                solutionIds.push(template.solutionId);
                            }

                            if (template.programId) {
                                programIds.push(template.programId);
                            }

                        })
                    }
                }

                let solutions = {};

                if (solutionIds.length > 0) {

                    let solutionData =
                    await kendraService.solutionDocuments({
                        _id: {
                            $in: solutionIds
                        }
                    }, "all", [
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

                    if( !solutionData.success ) {
                        throw {
                            message : CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
                            status : HTTP_STATUS_CODE['bad_request'].status
                        }
                    }

                    if (
                        solutionData.data && solutionData.data.length > 0
                    ) {

                        solutionData.data.forEach(solution => {
                            solutions[solution.externalId] = solution;
                        })
                    }

                }

                let programs = {};

                if (programIds.length > 0) {

                    let programData =
                    await kendraService.programsDocuments({
                        _id: {
                            $in: programIds
                        }
                    }, "all", ["components"]);

                    if( !programData.success ) {
                        throw {
                            message : CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
                            status : HTTP_STATUS_CODE['bad_request'].status
                        }
                    }

                    if (programData.data && programData.data.length > 0) {

                        programData.data.forEach(program => {
                            programs[program.externalId] = program;
                        })
                    }
                }

                for (
                    let pointerToCsvData = 0;
                    pointerToCsvData < csvData.length;
                    pointerToCsvData++
                ) {

                    let currentCsvData = csvData[pointerToCsvData];

                    if (!templateData[currentCsvData.templateId]) {
                        currentCsvData["STATUS"] =
                        CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND;
                        continue;
                    }

                    let currentTemplateData =
                    templateData[csvData[pointerToCsvData].templateId];

                    currentTemplateData.userId = csvData[pointerToCsvData]["keycloak-userId"];
                    currentTemplateData.createdBy = userId;
                    currentTemplateData.updatedBy = userId;

                    if (
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

                    if (currentTemplateData.solutionExternalId) {

                        if (!solutions[currentTemplateData.solutionExternalId]) {
                            
                            currentCsvData["STATUS"] =
                            CONSTANTS.apiResponses.SOLUTION_NOT_FOUND;
                            continue;
                        }

                        solutionInformation = solutions[currentTemplateData.solutionExternalId];
                        currentTemplateData.solutionInformation =
                        _.omit(
                            solutionInformation,
                            ["entities", "programId", "programExternalId"]
                        );

                        currentTemplateData.createdFor = solutionInformation.createdFor;
                        currentTemplateData.rootOrganisations = solutionInformation.rootOrganisations;

                        delete currentTemplateData.solutionId;
                        delete currentTemplateData.solutionExternalId;
                    }

                    if (currentTemplateData.programExternalId) {

                        if (!programs[currentTemplateData.programExternalId]) {
                            currentCsvData["STATUS"] =
                            CONSTANTS.apiResponses.PROGRAM_NOT_FOUND;
                            continue;
                        }

                        currentTemplateData.programInformation =
                        programs[currentTemplateData.programExternalId];

                        delete currentTemplateData.programId;
                        delete currentTemplateData.programExternalId;
                    }

                    if ( entityDocument[csvData[pointerToCsvData].entityId] ) {

                        let entities = [];

                        if (
                            solutionInformation.entities &&
                            solutionInformation.entities.length > 0
                        ) {
                            
                            let entityIndex =
                            solutionInformation.entities.findIndex(entity => entity._id === csvData[pointerToCsvData].entityId);

                            if (entityIndex < 0) {
                                
                                entities =
                                solutionInformation.entities.push(ObjectId(csvData[pointerToCsvData].entityId))
                            }
                        } else {
                            entities = [ObjectId(csvData[pointerToCsvData].entityId)];
                        }

                        if (entities.length > 0) {
                            await kendraService.updateSolution(
                                userToken,
                                {
                                    entities: entities
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

            if (
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

        projectSchemaKey.forEach(projectSchema => {

            const currentSchemaType = projectsSchema[projectSchema];

            if (currentSchemaType === "ObjectId") {
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

    static importFromLibrary(projectTemplateId, requestedData, userToken, userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let libraryProjects =
                    await libraryCategoriesHelper.projectDetails(
                        projectTemplateId
                    );

                if (
                    libraryProjects.data &&
                    !Object.keys(libraryProjects.data).length > 0
                ) {
                    throw {
                        message: CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND
                    };
                }

                let taskReport = {};

                if (
                    libraryProjects.data.tasks &&
                    libraryProjects.data.tasks.length > 0
                ) {

                    libraryProjects.data.tasks = await _projectTask(
                        libraryProjects.data.tasks,
                        true
                    );

                    taskReport.total = libraryProjects.data.tasks.length;

                    libraryProjects.data.tasks.forEach(task => {
                        if (!taskReport[task.status]) {
                            taskReport[task.status] = 1;
                        } else {
                            taskReport[task.status] += 1;
                        }
                    });

                    libraryProjects.data["taskReport"] = taskReport;
                }

                let programAndSolutionInformation =
                await this.createProgramAndSolution(
                    libraryProjects.data._id,
                    requestedData.entityId,
                    requestedData.programId,
                    requestedData.programName,
                    userToken
                );

                if (!programAndSolutionInformation.success) {
                    return resolve(programAndSolutionInformation);
                }

                let userOrganisations =
                await kendraService.getUserOrganisationsAndRootOrganisations(
                    userToken
                );

                if( !userOrganisations.success ) {
                    throw {
                        message : CONSTANTS.apiResponses.USER_ORGANISATION_NOT_FOUND,
                        status : HTTP_STATUS_CODE['bad_request'].status
                    }
                }

                libraryProjects.data.userId = libraryProjects.data.updatedBy = libraryProjects.data.createdBy = userId;
                libraryProjects.data.lastDownloadedAt = new Date();
                libraryProjects.data.status = CONSTANTS.common.NOT_STARTED_STATUS;

                let projectCreation = await database.models.projects.create(
                    _.merge(
                        _.omit(libraryProjects.data, ["_id"]),
                        programAndSolutionInformation.data
                    )
                );

                if (requestedData.rating && requestedData.rating > 0) {
                    await projectTemplatesHelper.ratings(
                        projectTemplateId,
                        requestedData.rating,
                        userToken
                    );
                }

                projectCreation = await _projectInformation(projectCreation._doc);

                return resolve({
                    success : true,
                    message : CONSTANTS.apiResponses.PROJECTS_FETCHED,
                    data : projectCreation.data
                });

            } catch (error) {
                return resolve({
                    success : false,
                    message : error.message,
                    data : {}
                });
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

    static create(userId, userToken) {
        return new Promise(async (resolve, reject) => {
            try {

                let creationData = {
                    lastDownloadedAt: new Date(),
                    createdFor: [],
                    rootOrganisations: []
                }

                creationData["userId"] = creationData["createdBy"] = creationData["updatedBy"] = userId;

                let userOrganisations =
                await kendraService.getUserOrganisationsAndRootOrganisations(
                    userToken
                );

                if( !userOrganisations.success ) {
                    throw {
                        message : CONSTANTS.apiResponses.USER_ORGANISATION_NOT_FOUND,
                        status : HTTP_STATUS_CODE['bad_request'].status
                    }
                }

                if (userOrganisations.data) {
                    creationData.createdFor = userOrganisations.data.createdFor;
                    creationData.rootOrganisations = userOrganisations.data.rootOrganisations;
                }

                let userProject = await database.models.projects.create(
                    creationData
                );

                return resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.CREATED_USER_PROJECT,
                    data: _.pick(userProject, ["_id", "lastDownloadedAt"])
                });

            } catch (error) {
                return resolve({
                    status : 
                    error.status ? 
                    error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                    success: false,
                    message: error.message,
                    data: {}
                });
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

    static sync(projectId, lastDownloadedAt, data, userId, userToken) {
        return new Promise(async (resolve, reject) => {
            try {

                const userProject = await this.projectDocument({
                    _id: projectId,
                    userId: userId,
                    lastDownloadedAt: lastDownloadedAt
                }, ["_id", "tasks"]);

                if (!userProject.length > 0) {

                    throw {
                        status : HTTP_STATUS_CODE['bad_request'].status,
                        message: CONSTANTS.apiResponses.USER_PROJECT_NOT_FOUND
                    };
                }

                const projectsModel = Object.keys(schemas["projects"].schema);

                let updateProject = {};

                if (data.categories && data.categories.length > 0) {
                    
                    let categories =
                    await _projectCategories(data.categories);

                    if( !categories.success ) {
                        return resolve(categories);
                    } 

                    updateProject.categories = categories.data;
                }

                if (data.startDate) {
                    updateProject["startDate"] = data.startDate;
                }

                if (data.endDate) {
                    updateProject["endDate"] = data.endDate;
                }

                if (
                    (data.programId && data.programId !== "") ||
                    (data.programName && data.programName !== "")
                ) {

                    let programAndSolutionInformation =
                    await this.createProgramAndSolution(
                        userProject[0]._id,
                        data.entityId,
                        data.programId,
                        data.programName,
                        userToken
                    );

                    if (!programAndSolutionInformation.success) {
                        return resolve(programAndSolutionInformation);
                    }

                    updateProject =
                    _.merge(updateProject, programAndSolutionInformation.data);
                }

                let booleanData = this.booleanData(schemas["projects"].schema);
                let mongooseIdData = this.mongooseIdData(schemas["projects"].schema);

                if (data.tasks) {

                    let taskReport = {};

                    updateProject.tasks = await _projectTask(
                        data.tasks
                    );

                    if (
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

                            if (taskIndex < 0) {
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
                        if (!taskReport[task.status]) {
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

                        if (booleanData.includes(updateData)) {

                            updateProject[updateData] =
                                UTILS.convertStringToBoolean(data[updateData]);

                        } else if (mongooseIdData.includes(updateData)) {
                            updateProject[updateData] = ObjectId(data[updateData]);
                        } else {
                            updateProject[updateData] = data[updateData];
                        }
                    }
                });

                updateProject.updatedBy = userId;
                updateProject.updatedAt = updateProject.lastSync = new Date();

                if (data.resources) {
                    updateProject.resources = data.resources;
                }

                let projectUpdated =
                await database.models.projects.findOneAndUpdate(
                    {
                        _id: userProject[0]._id
                    },
                    {
                        $set: updateProject
                    }, {
                        new: true
                    }
                );

                if (!projectUpdated._id) {
                    throw {
                        message: CONSTANTS.apiResponses.USER_PROJECT_NOT_UPDATED
                    }
                }

                return resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.USER_PROJECT_UPDATED
                });

            } catch (error) {
                return resolve({
                    status : 
                    error.status ? 
                    error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                    success: false,
                    message: error.message,
                    data: {}
                });
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
        projectId,
        entityId = "",
        programId = "",
        programName = "",
        userToken
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = {};

                if (entityId && entityId !== "") {
                    let entitiesData = await _entitiesInformation(entityId);

                    if( !entitiesData.success ) {
                        return resolve(entitiesData);
                    }

                    result["entityInformation"] = entitiesData.data[0];
                }

                let programAndSolutionData = {
                    entities:
                    result.entityInformation ?
                    [ObjectId(result.entityInformation._id)] : [],
                    type: CONSTANTS.common.IMPROVEMENT_PROJECT,
                    subType: CONSTANTS.common.IMPROVEMENT_PROJECT,
                    project : {
                        _id : ObjectId(projectId)
                    }
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


                if (programName !== "") {
                    programAndSolutionData["programName"] = programName;
                }

                if (programId !== "") {
                    programAndSolutionData["programId"] = programId;
                }

                let solutionAndProgramCreation =
                await kendraService.createUserProgramAndSolution(
                    programAndSolutionData,
                    userToken
                );

                if (!solutionAndProgramCreation.success) {
                    throw {
                        status : HTTP_STATUS_CODE['bad_request'].status,
                        message : CONSTANTS.apiResponses.SOLUTION_PROGRAMS_NOT_CREATED
                    };
                }

                result.solutionInformation = _.omit(
                    solutionAndProgramCreation.data.solution,
                    ["__v"]
                );

                result.solutionInformation._id =
                ObjectId(result.solutionInformation._id);

                result.programInformation = _.omit(
                    solutionAndProgramCreation.data.program,
                    ["__v", "components"]
                );

                result.programInformation._id =
                ObjectId(result.programInformation._id);

                return resolve({
                    success : true,
                    data : result
                });

            } catch (error) {
                return resolve({
                    status : 
                    error.status ? 
                    error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                    success : false,
                    message : error.message,
                    data : {}
                });
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

    static details(projectId, userId) {
        return new Promise(async (resolve, reject) => {
            try {

                const projectDetails = await this.projectDocument({
                    _id: projectId,
                    userId: userId
                }, "all",
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

                if (!projectDetails.length > 0) {

                    throw {
                        status : HTTP_STATUS_CODE["bad_request"].status,
                        message: CONSTANTS.apiResponses.PROJECT_NOT_FOUND
                    }
                }

                let result = await _projectInformation(projectDetails[0]);

                if( !result.success ) {
                    return resolve(projectInformation);
                }

                return resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.PROJECT_DETAILS_FETCHED,
                    data: result.data
                });

            } catch (error) {
                return resolve({
                    status : 
                    error.status ? 
                    error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                    success: false,
                    message: error.message,
                    data: []
                });
            }
        })
    }

    /**
      * List of library projects.
      * @method
      * @name projects
      * @param pageSize - Size of page.
      * @param pageNo - Recent page no.
      * @param search - search text.
      * @returns {Object} List of library projects.
     */

    static projects(query, pageSize, pageNo, searchQuery, fieldsArray) {
        return new Promise(async (resolve, reject) => {
            try {

                let matchQuery = {
                    $match: query
                };

                if (searchQuery && searchQuery.length > 0) {
                    matchQuery["$match"]["$or"] = searchQuery;
                }

                let projection = {}
                fieldsArray.forEach(field => {
                    projection[field] = 1;
                });


                let aggregateData = [];
                aggregateData.push(matchQuery);

                aggregateData.push({
                    $project: projection
                }, {
                    $facet: {
                        "totalCount": [
                            { "$count": "count" }
                        ],
                        "data": [
                            { $skip: pageSize * (pageNo - 1) },
                            { $limit: pageSize }
                        ],
                    }
                }, {
                    $project: {
                        "data": 1,
                        "count": {
                            $arrayElemAt: ["$totalCount.count", 0]
                        }
                    }
                });

                let result =
                await database.models.projects.aggregate(aggregateData);

                return resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.PROJECTS_FETCHED,
                    data: {
                        data: result[0].data,
                        count: result[0].count ? result[0].count : 0
                    }
                })

            } catch (error) {
                return resolve({
                    success : false,
                    message : error.message,
                    data : {
                        data : [],
                        count : 0
                    }
                });
            }
        })
    }

    /**
      * To get uploadable file url
      * @method
      * @name getFileUploadUrl 
      * @param {Object} input - request files
      * @param {String} userId - Logged in user id.
      * @returns {Object} - returns file uploadable urls
    */
    static getFileUploadUrl(input, userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let allFileNames = [];
                var requestFileNames = {};
                let projectIds = Object.keys(input);
                projectIds.map(projectId => {
                    let images = input[projectId].images;
                    requestFileNames[projectId] = [];
                    if(images && images.length > 0){
                        images.map(image=>{
                            var fileName = userId + "/"+projectId+"/" + uuidv4() + "_" + image;
                            fileName = (fileName.replace(/\s+/g, '')).trim();
                            requestFileNames[fileName] = {
                                projectId:projectId,
                                name:image
                            }
                            allFileNames.push(fileName);
                        });
                    }
                });

                let fileUploadResponse = {};
                let response = await kendraService.getPreSignedUrl(allFileNames);

                if( !response.success ) {
                    throw {
                        message : CONSTANTS.apiResponses.FAILED_TO_GENERATE_PRESSIGNED_URLS
                    };
                }

                if ( response.data.result && response.data.result.length > 0 ) {
                    response.data.result = response.data.result.map(element => {
                        
                        let fileInfo = requestFileNames[element.file].projectId;
                        if(fileUploadResponse[fileInfo]) {
                            element.file = requestFileNames[element.file].name;
                            fileUploadResponse[fileInfo]['images'].push(element);
                        } else {
                            fileUploadResponse[fileInfo] = {
                                images : []
                            }
                            element.file = requestFileNames[element.file].name;
                            fileUploadResponse[fileInfo]['images'].push(element);
                        }
                    })
                }

                return resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.PRESSIGNED_URLS_GENERATED,
                    data: fileUploadResponse
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: []
                });
            }
        })
    }

      /**
      * Get tasks from a user project.
      * @method
      * @name tasks 
      * @param {String} projectId - Project id. 
      * @param {Array} taskIds - Array of tasks ids.
      * @returns {Object} - return tasks from a project. 
    */

   static tasks(projectId, taskIds) {
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

            let projects = 
            await database.models.projects.aggregate(aggregatedData);

            return resolve({
                success : true,
                data : projects
            });

           } catch (error) {
               return resolve({
                   success : false,
                   data : []
               });
            }
        })
   }

   /**
    * Status of tasks.
    * @method
    * @name tasksStatus 
    * @param {String} projectId - Project id.
    * @param {Array} taskIds - Tasks ids.
    * @returns {Object}
   */

  static tasksStatus( projectId,taskIds = [] ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            let tasks = await this.tasks(projectId,taskIds);

            if( !tasks.success || !tasks.data.length > 0 ) {
                
                throw {
                    status : HTTP_STATUS_CODE['bad_request'].status,
                    message : CONSTANTS.apiResponses.PROJECT_NOT_FOUND
                };
            }

            let projectTasks = tasks.data[0].tasks;
            let result = [];

            for( let task = 0; task < projectTasks.length ; task ++ ) {
                
                let currentTask = projectTasks[task];
                
                let data = {
                    type : currentTask.type,
                    status : currentTask.status,
                    _id : currentTask._id
                };

                if( currentTask.submissionDetails && currentTask.submissionDetails._id ) {
                    data["submissionId"] = currentTask.submissionDetails._id;
                }
                
                result.push(data);
            }

            return resolve({
                success : true,
                message : CONSTANTS.apiResponses.TASKS_STATUS_FETCHED,
                data : result
            });

        } catch (error) {
            return reject({
                success : false,
                message : error.message,
                data : []
            });
        }
    })
  }

   /**
    * Update task.
    * @method
    * @name updateTask 
    * @param {String} projectId - Project id.
    * @param {String} taskId - Task id.
    * @param {Object} updatedData - Update data.
    * @returns {Object}
   */

  static updateTask( projectId,taskId, updatedData) {
    return new Promise(async (resolve, reject) => {
        try {

            let update = {};

            Object.keys(updatedData).forEach(taskData=>{
                update["tasks.$." + taskData] = updatedData[taskData];
            });

            const tasksUpdated = 
            await database.models.projects.findOneAndUpdate({
                _id : projectId,
                "tasks._id" : taskId
            },{ $set : update });

            return resolve(tasksUpdated);

        } catch (error) {
            return reject(error);
        }
    })
  }

   /**
    * Solutions details
    * @method
    * @name solutionDetails 
    * @param {String} userToken - Logged in user token.
    * @param {String} projectId - Project id.
    * @param {Array} taskId - Tasks id.
    * @returns {Object}
   */

  static solutionDetails( userToken,projectId,taskId ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            let project = await this.projectDocument(
                {
                    "_id" : projectId,
                    "tasks._id" : taskId
                },[
                    "entityInformation._id",
                    "tasks.type",
                    "tasks._id",
                    "tasks.solutionDetails",
                    "tasks.submissionDetails",
                    "programInformation._id"
                ]
            );

            if( !project.length > 0 ) {
                throw {
                    status : HTTP_STATUS_CODE['bad_request'].status,
                    message : CONSTANTS.apiResponses.USER_PROJECT_NOT_FOUND
                };
            }

            let currentTask = project[0].tasks.find(task => task._id == taskId);
            
            let assessmentOrObservationData = {
                entityId : project[0].entityInformation._id,
                programId : project[0].programInformation._id
            }

            if( currentTask.submissionDetails ) {
                assessmentOrObservationData = currentTask.submissionDetails;
            } else {
                
                if( 
                    currentTask.solutionDetails.type === CONSTANTS.common.ASSESSMENT 
                ) {
                    
                    let duplicateSolution = await _assessmentDetails(
                        userToken,
                        currentTask.solutionDetails,
                        assessmentOrObservationData.entityId,
                        assessmentOrObservationData.programId,
                        {
                            "projectId" : projectId,
                            "taskId" : taskId
                        }
                    );

                    if( !duplicateSolution.success ) {
                        return resolve(duplicateSolution);
                    }
                    
                    assessmentOrObservationData["solutionId"] = 
                    ObjectId(duplicateSolution.data._id);

                } else if( 
                    currentTask.solutionDetails.type === CONSTANTS.common.OBSERVATION 
                ) {
                    
                    let observationData = await _observationDetails(
                        userToken,
                        currentTask.solutionDetails,
                        assessmentOrObservationData.entityId,
                        assessmentOrObservationData.programId,
                        projectId,
                        taskId
                    );

                    assessmentOrObservationData["observationId"] = 
                    ObjectId(observationData.data.observationId);

                    assessmentOrObservationData["solutionId"] = 
                    ObjectId(observationData.data.solutionId);
                }

                await database.models.projects.findOneAndUpdate({
                    "_id" : projectId,
                    "tasks._id" : taskId
                },{ 
                    $set : { 
                        "tasks.$.submissionDetails" : assessmentOrObservationData 
                    }
                });

            }

            return resolve({
                success: true,
                message : CONSTANTS.apiResponses.SOLUTION_DETAILS_FETCHED,
                data : assessmentOrObservationData
            });

        } catch (error) {
            return resolve({
                status : 
                error.status ? 
                error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                success : false,
                message : error.message,
                data : {}
            });
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

    return new Promise(async (resolve, reject) => {
        try {

            if( project.entityInformation ) {
                project.entityId = project.entityInformation._id;
                project.entityName = project.entityInformation.name;
                project.entityType = project.entityInformation.entityType;
                project.entityTypeId = project.entityInformation.entityTypeId;
            }
        
            if( project.solutionInformation ) {
                project.solutionId = project.solutionInformation._id;
                project.solutionExternalId = project.solutionInformation.externalId;
                project.solutionName = project.solutionInformation.name;
            }
        
            if (project.programInformation ) {
                project.programId = project.programInformation._id;
                project.programExternalId = project.programInformation.externalId;
                project.programName = project.programInformation.name;
            }
        
            if( project.tasks && project.tasks.length > 0 ) {
                
                let attachments = [];
                let mapTaskIdToAttachment = {};
        
                for( let task = 0; task < project.tasks.length; task ++ ) {
                    
                    let currentTask = project.tasks[task];
        
                    if( currentTask.attachments && currentTask.attachments.length > 0 ) {
                        for( 
                            let attachment = 0 ; 
                            attachment < currentTask.attachments.length ; 
                            attachment ++ 
                        ) {
                            let currentAttachment = currentTask.attachments[attachment];
                            attachments.push(currentAttachment.sourcePath);
                            
                            if( !mapTaskIdToAttachment[currentAttachment.sourcePath] ) {
                                mapTaskIdToAttachment[currentAttachment.sourcePath] = {
                                    taskId : currentTask._id
                                };
                                
                            }
                        }
                    }
        
                }
        
                if( attachments.length > 0 ) {
        
                    let attachmentsUrl = 
                    await kendraService.getDownloadableUrl(
                        {
                            filePaths : attachments
                        }
                    );

                    if( !attachmentsUrl.success ) {
                        throw {
                            status : HTTP_STATUS_CODE['bad_request'].status,
                            message : CONSTANTS.apiResponses.ATTACHMENTS_URL_NOT_FOUND
                        }
                    }
        
                    if( attachmentsUrl.data.length > 0 ) {
                        attachmentsUrl.data.forEach( attachmentUrl => {
                            
                            let taskIndex = 
                            project.tasks.findIndex(task => task._id === mapTaskIdToAttachment[attachmentUrl.filePath].taskId);
        
                            if( taskIndex > -1 ) {
                                let attachmentIndex = 
                                project.tasks[taskIndex].attachments.findIndex(attachment => attachment.sourcePath === attachmentUrl.filePath);

                                if( attachmentIndex > -1 ) {
                                    project.tasks[taskIndex].attachments[attachmentIndex].url = attachmentUrl.url;
                                }
                            }
                        })
                    }
                    
                }
        
            }

            project.status = CONSTANTS.common.NOT_STARTED_STATUS;

            if (project.metaInformation) {
                Object.keys(project.metaInformation).forEach(projectMetaKey => {
                    project[projectMetaKey] = project.metaInformation[projectMetaKey];
                });
            }

            delete project.metaInformation;
            delete project.__v;
            delete project.entityInformation;
            delete project.solutionInformation;
            delete project.programInformation;

            return resolve({
                success : true,
                data : project
            });

        } catch(error) {
            return resolve({
                message : error.message,
                success : false,
                status : 
                error.status ? 
                error.status : HTTP_STATUS_CODE['internal_server_error'].status
            })
        }
    })

    // <- Dirty Fix not required response in this format.

    // project.entityInformation = _.pick(
    //     project.entityInformation,
    //     ["externalId", "name", "entityType", "entityTpeId"]
    // );

    

    // <- Dirty Fix not required response in this format.
    // project.solutionInformation = _.pick(
    //     project.solutionInformation,
    //     ["externalId", "name"]
    // );

    // project.programInformation = _.pick(
    //     project.programInformation,
    //     ["externalId", "name"]
    // );

    // project.status = CONSTANTS.common.NOT_STARTED_STATUS;

    // if (project.metaInformation) {
    //     Object.keys(project.metaInformation).forEach(projectMetaKey => {
    //         project[projectMetaKey] = project.metaInformation[projectMetaKey];
    //     });
    // }

    // delete project.metaInformation;
    // delete project.__v;
    // delete project.entityInformation;
    // delete project.solutionInformation;
    // delete project.programInformation;

    // return project;
}

/**
  * Task of project.
  * @method
  * @name _projectTask
  * @param {Array} tasks - tasks data.
  * @param {String} userId - logged in user id.
  * @returns {Object} Project task.
*/

function _projectTask(tasks, isImportedFromLibrary = false) {

    tasks.forEach(singleTask => {

        singleTask.externalId = singleTask.externalId ? singleTask.externalId : singleTask.name.toLowerCase();
        singleTask.type = singleTask.type ? singleTask.type : CONSTANTS.common.SIMPLE_TASK_TYPE;
        singleTask.status = singleTask.status ? singleTask.status : CONSTANTS.common.NOT_STARTED_STATUS;
        singleTask.isDeleted = singleTask.isDeleted ? singleTask.isDeleted : false;
        singleTask.isDeleteable = singleTask.isDeleteable ? singleTask.isDeleteable : false;
        singleTask.createdAt = singleTask.createdAt ? singleTask.createdAt : new Date();
        singleTask.updatedAt = new Date();
        singleTask._id = UTILS.isValidMongoId(singleTask._id.toString()) ? uuidv4() : singleTask._id;
        singleTask.isImportedFromLibrary = isImportedFromLibrary;
        singleTask.lastSync = new Date();

        if (singleTask.startDate) {
            singleTask.startDate = singleTask.startDate;
        }

        if (singleTask.endDate) {
            singleTask.endDate = singleTask.endDate;
        }

        if (singleTask.children) {
            _projectTask(singleTask.children);
        } else {
            singleTask.children = [];
        }

    })

    return tasks;
}

/**
  * Project categories information.
  * @method
  * @name _projectCategories 
  * @param {Array} categories - Categories data.
  * @returns {Object} Project categories information.
*/

function _projectCategories(categories) {
    return new Promise(async (resolve, reject) => {
        try {

            const categoryIds = categories.map(category => {
                if (category.value && category.value !== "") {
                    return category.value;
                }
            });

            const categoryData =
            await libraryCategoriesHelper.categoryDocuments({
                _id: { $in: categoryIds }
            }, ["name", "externalId"]);

            if( !categoryData.length > 0 ) {
                throw {
                    status : HTTP_STATUS_CODE['bad_request'].status,
                    message: CONSTANTS.apiResponses.CATEGORY_NOT_FOUND
                }
            }

            let categoryInternalIdToData = {};

            if (categoryData.length > 0) {

                categoryData.forEach(category => {
                    categoryInternalIdToData[category._id.toString()] = category;
                });
            }

            const categoriesData = categories.map(category => {
                let categoryData = {};

                if (
                    category.value &&
                    category.value !== "" &&
                    categoryInternalIdToData[category.value]
                ) {
                    categoryData = categoryInternalIdToData[category.value];
                } else {
                    categoryData = {
                        name: category.label,
                        externalId: "",
                        _id: ""
                    }
                }

                return categoryData;
            });

            return resolve({
                success : true,
                data : categoriesData
            });

        } catch (error) {
            return resolve({
                message : error.message,
                status : 
                error.status ? 
                error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                success : false,
                data : {}
            });
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
    return new Promise(async (resolve, reject) => {
        try {

            let entityData =
            await kendraService.entityDocuments(
                {
                    _id: {
                        $in: entityIds
                    }
                },
                ["metaInformation", "entityType", "entityTypeId"]
            );

            if( !entityData.success ) {
                throw {
                    status : HTTP_STATUS_CODE['bad_request'].status,
                    message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND
                }
            }

            let entitiesData = [];

            if (entityData.success && entityData.data.length > 0) {

                entitiesData = entityData.data.map(entity => {
                    entity.metaInformation._id = ObjectId(entity._id);
                    entity.metaInformation.entityType = entity.entityType;
                    entity.metaInformation.entityTypeId = ObjectId(entity.entityTypeId);
                    return entity.metaInformation;
                });
            }

            return resolve({
                success : true,
                data : entitiesData
            });

        } catch (error) {
            return resolve({
                status : 
                error.status ? 
                error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                success : false,
                message : error.message,
                data : []
            });
        }
    })
}

 /**
    * Assessment details
    * @method
    * @name _assessmentDetails 
    * @param {String} userToken - Logged in user token.
    * @param {Object} solutionDetails - Solution details.
    * @param {String} entityId - Entity id.
    * @param {String} programId - Program id.
    * @param {String} projectId - Project id.
    * @param {String} taskId - Tasks id.
    * @returns {Object} 
*/

function _assessmentDetails(
    userToken,
    solutionDetails,
    entityId,
    programId,
    project
) {
    return new Promise(async (resolve, reject) => {
        try {

            let result = {};

            if( solutionDetails.isReusable ) {
                
                result = await assessmentService.createAssessmentSolutionFromTemplate(
                    userToken,
                    solutionDetails._id,
                    {
                        name : solutionDetails.name + "-" + UTILS.epochTime(),
                        description : solutionDetails.name + "-" + UTILS.epochTime(),
                        program : {
                            _id : programId,
                            name : ""
                        },
                        entities : [entityId],
                        project : project
                    }
                );

                if( !result.success ) {
                    throw {
                        status : HTTP_STATUS_CODE['bad_request'].status,
                        message : CONSTANTS.apiResponses.COULD_NOT_CREATE_ASSESSMENT_SOLUTION
                    }
                }

            } else {

                result = await assessmentService.addEntityToAssessmentSolution(
                    userToken,
                    solutionDetails._id,
                    [entityId.toString()]
                );

                if( !result.success ) {
                    throw {
                        status : HTTP_STATUS_CODE['bad_request'].status,
                        message : CONSTANTS.apiResponses.FAILED_TO_ADD_ENTITY_TO_SOLUTION
                    }
                }

                await kendraService.updateSolution(
                    userToken,
                    {
                        taskId : taskId,
                        projectId : ObjectId(projectId)
                    },
                    solutionDetails.externalId
                );

                result["data"]["_id"] = solutionDetails._id;

            }

            return resolve({
                success : true,
                data : result.data
            });
        } catch(error) {
            return resolve({
                message : error.message,
                success : false,
                status : error.status ? 
                error.status : HTTP_STATUS_CODE['internal_server_error'].status
            });
        }
    })
}

 /**
    * Observation details
    * @method
    * @name _observationDetails 
    * @param {String} userToken - Logged in user token.
    * @param {Object} solutionDetails - Solution details.
    * @param {String} entityId - Entity id.
    * @param {String} programId - Program id.
    * @param {String} projectId - Project id.
    * @param {String} taskId - Tasks id.
    * @returns {Object} 
*/

function _observationDetails( userToken,solutionDetails,entityId,programId,projectId,taskId ) {
    return new Promise(async (resolve, reject) => {
        try {

            let result = {};

            if( solutionDetails.isReusable ) {
                
                result = await assessmentService.createObservationFromSolutionTemplate(
                    userToken,
                    solutionDetails._id,
                    {
                        name : solutionDetails.name + "-" + UTILS.epochTime(),
                        description : solutionDetails.name + "-" + UTILS.epochTime(),
                        program : {
                            _id : programId,
                            name : ""
                        },
                        status : CONSTANTS.common.PUBLISHED_STATUS,
                        entities : [entityId],
                        projectId : projectId,
                        taskId : taskId
                    }
                );
            } else {

                result = await assessmentService.addEntityToObservation(
                    userToken,
                    solutionDetails.observationId,
                    [entityId.toString()]
                );

                await kendraService.updateSolution(
                    userToken,
                    {
                        taskId : taskId,
                        projectId : ObjectId(projectId)
                    },
                    solutionDetails.externalId
                );

                await kendraService.updateObservation(
                    userToken,
                    {
                        taskId : taskId,
                        projectId : ObjectId(projectId)
                    },
                    solutionDetails.observationId
                )

                if( result.success ) {
                    result.data["observationId"] = solutionDetails.observationId;
                    result.data["solutionId"] = solutionDetails._id;
                }
            }

            return resolve(result);
        } catch(error) {
            return reject(error);
        }
    })
}





