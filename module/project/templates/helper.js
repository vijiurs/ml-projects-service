/**
 * name : helper.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Project templates helper functionality.
 */

/**
    * ProjectTemplatesHelper
    * @class
*/

// Dependencies

const libraryCategoriesHelper = require(MODULES_BASE_PATH + "/library/categories/helper");
const kendraService = require(GENERICS_FILES_PATH + "/services/kendra");
const kafkaProducersHelper = require(GENERICS_FILES_PATH + "/kafka/producers");
const learningResourcesHelper = require(MODULES_BASE_PATH + "/learningResources/helper");

module.exports = class ProjectTemplatesHelper {

     /**
     * Lists of template.
     * @method
     * @name templateDocument
     * @param {Array} [filterData = "all"] - template filter query.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [skipFields = "none"] - field not to include
     * @returns {Array} Lists of template. 
     */
    
    static templateDocument(
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
               await database.models.projectTemplates.find(
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
      * Extract csv information.
      * @method
      * @name extractCsvInformation
      * @param {Object} csvData - csv data.
      * @returns {Object} Extra csv information.
     */

    static extractCsvInformation(csvData) {
        return new Promise(async (resolve, reject) => {
            try {

                let categoryIds = [];
                let roleIds = [];
                let tasksIds = [];
                let entityTypes = [];

                csvData.forEach(template=>{
                    
                    let parsedData = UTILS.valueParser(template);
                    
                    categoryIds = _.concat(
                        categoryIds,
                        parsedData.categories
                    );

                    tasksIds = _.concat(
                        tasksIds,
                        parsedData.tasks
                    );

                    parsedData.recommendedFor = 
                    parsedData.recommendedFor.map(role=>{
                        return role.toUpperCase()
                    });

                    roleIds = _.concat(
                        roleIds,
                        parsedData.recommendedFor
                    );

                    entityTypes.push(parsedData.entityType);

                });

                let categoriesData = {};

                if( categoryIds.length > 0 ) {

                    let categories = 
                    await libraryCategoriesHelper.categoryDocuments({
                        externalId : { $in : categoryIds }
                    },["externalId","name"]);

                    if( !categories.length > 0 ) {
                        throw {
                            status : HTTP_STATUS_CODE['bad_request'].status,
                            message : CONSTANTS.apiResponses.LIBRARY_CATEGORIES_NOT_FOUND
                        }
                    }

                    categoriesData = categories.reduce((ac,category)=> ({
                        ...ac,
                        [category.externalId] : {
                            _id : ObjectId(category._id),
                            externalId : category.externalId,
                            name : category.name
                        }
                    }),{});
                }

                let recommendedFor = {};

                if( roleIds.length > 0 ) {

                    let userRolesData = 
                    await kendraService.rolesDocuments({
                        code : { $in : roleIds }
                    },["code"]);

                    if( !userRolesData.success ) {
                        throw {
                            message : CONSTANTS.apiResponses.USER_ROLES_NOT_FOUND,
                            status : HTTP_STATUS_CODE['bad_request'].status
                        }
                    }

                    recommendedFor = userRolesData.data.reduce((ac,role)=> ({
                        ...ac,
                        [role.code] : {
                            roleId : ObjectId(role._id),
                            code : role.code
                        }
                    }),{});
                }

                let entityTypesData = {};

                if( entityTypes.length > 0 ) {
                    
                    let entityTypesDocument = 
                    await kendraService.entityTypesDocuments({
                        name : { $in : entityTypes }
                    },["name"]);

                    if( !entityTypesDocument.success ) {
                        throw {
                            message : CONSTANTS.apiResponses.ENTITY_TYPES_NOT_FOUND,
                            status : HTTP_STATUS_CODE['bad_request'].status
                        }
                    }

                    entityTypesData = entityTypesDocument.data.reduce((ac,entityType)=> ({
                        ...ac,
                        [entityType.name] : {
                            _id : ObjectId(entityType._id),
                            name : entityType.name
                        }
                    }),{});

                }

                return resolve({
                    success : true,
                    data : {
                        categories : categoriesData,
                        roles : recommendedFor,
                        entityTypes : entityTypesData
                    }
                });

            } catch(error) {
                return resolve({
                    success : false,
                    message : error.message,
                    status : error.status ? error.status : HTTP_STATUS_CODE['internal_server_error'].status
                });
            }
        })
    }

     /**
      * Template data.
      * @method
      * @name templateData
      * @param {Object} data  - csv data.
      * @param {Object} csvInformation - csv information.
      * @returns {Object} Template data.
     */

    static templateData(data,csvInformation) {
        return new Promise(async (resolve, reject) => {
            try {

                let templatesDataModel = 
                Object.keys(schemas["project-templates"].schema);
                let parsedData = UTILS.valueParser(data);
                delete parsedData._arrayFields;

                let categories = [];

                if( parsedData.categories && parsedData.categories.length > 0 ) {

                    await database.models.projectCategories.updateMany({
                        externalId : { $in : parsedData.categories }
                    },{
                        $inc : { noOfProjects : 1 }
                    });

                    parsedData.categories.forEach(category=>{
                        if( csvInformation.categories[category] ) {
                            return categories.push(
                                csvInformation.categories[category]
                            );
                        }
                    });
                }

                parsedData.categories = categories;

                let recommendedFor = [];
                
                if( parsedData.recommendedFor && parsedData.recommendedFor.length > 0 ) {
                    parsedData.recommendedFor.forEach(recommended => {
                        if( csvInformation.roles[recommended.toUpperCase()] ) {
                            return recommendedFor.push(
                                csvInformation.roles[recommended.toUpperCase()]
                            );
                        }
                    });
                }

                parsedData.recommendedFor = recommendedFor;

                let entityType = "";
                let entityTypeId = "";

                if( parsedData.entityType ) {
                    entityType = csvInformation.entityTypes[parsedData.entityType].name;
                    entityTypeId = csvInformation.entityTypes[parsedData.entityType]._id;
                }

                parsedData.entityType = entityType;
                parsedData.entityTypeId = entityTypeId;

                let learningResources = 
                await learningResourcesHelper.extractLearningResourcesFromCsv(parsedData);
                parsedData.learningResources = learningResources.data;

                parsedData.metaInformation = {};
                let booleanData = 
                UTILS.getAllBooleanDataFromModels(
                    schemas["project-templates"].schema
                );

                Object.keys(parsedData).forEach(eachParsedData=>{
                    if( !templatesDataModel.includes(eachParsedData) ) {
                        parsedData.metaInformation[eachParsedData] = 
                        parsedData[eachParsedData];
                        delete parsedData[eachParsedData];
                    } else {
                        if( booleanData.includes(eachParsedData) ) {
                            parsedData[eachParsedData] = 
                            UTILS.convertStringToBoolean(parsedData[eachParsedData]);
                        }
                    }
                });

                parsedData.isReusable = true;

                return resolve(parsedData);

            } catch(error) {
                return reject(error);
            }
        })
    }

    /**
      * Bulk created project templates.
      * @method
      * @name bulkCreate - bulk create project templates.
      * @param {Array} templates - csv templates data.
      * @param {String} userId - logged in user id.
      * @returns {Object} Bulk create project templates.
     */

    static bulkCreate(templates,userId) {
        
        return new Promise(async (resolve, reject) => {

            try {
                
                const fileName = `project-templates-creation`;
                let fileStream = new CSV_FILE_STREAM(fileName);
                let input = fileStream.initStream();
      
                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let csvInformation = await this.extractCsvInformation(templates);

                if( !csvInformation.success ) {
                    return resolve(csvInformation);
                }

                for ( let template = 0; template < templates.length ; template ++ ) {

                    let currentData = templates[template];
                    
                    let templateData = 
                    await this.templateDocument({
                        externalId : currentData.externalId,
                        isReusable : true
                    },["_id"]);

                    if( templateData.length > 0 && templateData[0]._id ) {
                        currentData["_SYSTEM_ID"] = 
                        CONSTANTS.apiResponses.PROJECT_TEMPLATE_EXISTS;
                    } else {

                        let templateData = await this.templateData(
                            currentData,
                            csvInformation.data,
                            userId
                        );

                        templateData.status = CONSTANTS.common.DRAFT_STATUS;
                        templateData.createdBy = templateData.updatedBy = templateData.userId = userId;
                        templateData.isReusable = true;
    
                        let createdTemplate = 
                        await database.models.projectTemplates.create(
                            templateData
                        ); 
    
                        if( !createdTemplate._id ) {
                            currentData["_SYSTEM_ID"] = CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND;
                        } else {
                            
                            currentData["_SYSTEM_ID"] = createdTemplate._id;

                            const kafkaMessage = 
                            await kafkaProducersHelper.pushProjectToKafka({
                                internal: false,
                                text: 
                                templateData.categories.length === 1 ?  
                                `A new project has been added under ${templateData.categories[0].name} category in library.` : 
                                `A new project has been added in library`,
                                type: "information",
                                action: "mapping",
                                payload: {
                                    project_id: createdTemplate._id
                                },
                                is_read : false,
                                internal : false,
                                title: "New project Available!",
                                created_at: new Date(),
                                type: process.env.IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE
                            });

                            if (kafkaMessage.status !== CONSTANTS.common.SUCCESS) {
                                currentData["_SYSTEM_ID"] = CONSTANTS.apiResponses.COULD_NOT_PUSHED_TO_KAFKA;
                            }

                        }

                    }

                    input.push(currentData);

                }

                input.push(null);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Bulk update project templates.
      * @method
      * @name bulkUpdate - bulk update project templates.
      * @param {Array} templates - csv templates data.
      * @param {String} userId - logged in user id.
      * @returns {Object} Bulk Update Project templates.
     */

    static bulkUpdate(templates,userId) {
        return new Promise(async (resolve, reject) => {
            try {

                const fileName = `project-templates-updation`;
                let fileStream = new CSV_FILE_STREAM(fileName);
                let input = fileStream.initStream();
      
                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let csvInformation = await this.extractCsvInformation(templates);

                if( !csvInformation.success ) {
                    return resolve(csvInformation);
                }

                for ( let template = 0; template < templates.length ; template ++ ) {

                    const currentData = templates[template];

                    if ( !currentData._SYSTEM_ID ) {
                        currentData["UPDATE_STATUS"] = 
                        CONSTANTS.apiResponses.MISSING_PROJECT_TEMPLATE_ID;
                    } else {

                        const template = 
                        await this.templateDocument({
                            _id : currentData._SYSTEM_ID
                        },["_id","categories"]);

                        if ( !(template.length > 0 && template[0]._id) ) {
                            currentData["UPDATE_STATUS"] = 
                            constants.apiResponses.PROJECT_TEMPLATE_NOT_FOUND;
                        } else {
                                
                            let templateData = await this.templateData(
                                _.omit(currentData,["_SYSTEM_ID"]),
                                csvInformation,
                                userId
                            );

                            templateData.updatedBy = userId;

                            await database.models.projectTemplates.findOneAndUpdate({
                                _id : currentData._SYSTEM_ID
                            },{
                                $set : templateData
                            },{
                                    new : true
                            });

                            if( 
                                template[0].categories && 
                                template[0].categories.length > 0 
                            ) {
                                
                                const categories = 
                                template[0].categories.map(category=>{
                                    return category._id;    
                                });

                                await database.models.projectCategories.updateMany({
                                    _id : { $in : categories }
                                },{
                                    $inc : { noOfProjects : -1 }
                                });
                            }

                            currentData["UPDATE_STATUS"] = CONSTANTS.common.SUCCESS;
                        }

                    }

                    input.push(templates[template]);

                }

                input.push(null);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Bulk update project templates.
      * @method
      * @name importProjectTemplate - import templates from existing project templates.
      * @param {String} templateId - project template id.
      * @param {String} userId - logged in user id.
      * @param {String} userToken - logged in user token.
      * @param {String} solutionId - solution id.
      * @param {Object} updateData - template update data.
      * @returns {Object} imported templates data.
     */

    static importProjectTemplate( templateId,userId,userToken,solutionId,updateData = {} ) {
        return new Promise(async (resolve, reject) => {
            try {

                let projectTemplateData = 
                await this.templateDocument({
                    externalId : templateId,
                    isReusable : true
                });

                if ( !projectTemplateData.length > 0 ) {
                    throw new Error(CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND)
                }

                let newProjectTemplate = {...projectTemplateData[0]};
                newProjectTemplate.externalId = 
                projectTemplateData[0].externalId +"-"+ UTILS.epochTime();
                newProjectTemplate.createdBy = newProjectTemplate.updatedBy = userId;

                if( solutionId !== "" ) {
                    
                    let solutionData = 
                    await kendraService.solutionDocuments({
                        externalId : solutionId
                    },["_id","externalId","programId","programExternalId"]);
    
                    if( !solutionData.success ) {
                       throw new Error(CONSTANTS.apiResponses.SOLUTION_NOT_FOUND)
                    }

                    newProjectTemplate.solutionId = solutionData.data[0]._id;
                    newProjectTemplate.solutionExternalId = solutionData.data[0].externalId;
                    newProjectTemplate.programId = solutionData.data[0].programId;
                    newProjectTemplate.programExternalId = solutionData.data[0].programExternalId;
                } 

                newProjectTemplate.parentTemplateId = projectTemplateData[0]._id;

                let updationKeys = Object.keys(updateData);

                if( updationKeys.length > 0 ) {

                    updationKeys.forEach(singleKey=>{
                        if( newProjectTemplate[singleKey] ) {
                            newProjectTemplate[singleKey] = updateData[singleKey];
                        }
                    })
                }

                let tasksIds, newProjectTemplateTask, duplicateTemplateTask,newProjectTemplateChildTask,duplicateChildTemplateTask;
                let newTaskId = [];

                if( 
                    projectTemplateData[0].tasks && 
                    projectTemplateData[0].tasks.length > 0 
                ){
                    let duplicatedTasks = 
                    await this.duplicateTemplateTasks(projectTemplateData[0].tasks);
                }

                if(Array.isArray(tasksIds) && tasksIds.length > 0 ){

                    await Promise.all(tasksIds.map(async taskId => {
                       
                       let taskData = await database.models.projectTemplateTasks.findOne(
                        {
                            _id : taskId
                        }).lean();

                        if(taskData){

                            newProjectTemplateTask = {...taskData};
                            newProjectTemplateTask.projectTemplateId = duplicateTemplateDocument._id;
                            newProjectTemplateTask.externalId = taskData.externalId +"-"+ UTILS.epochTime();
                            duplicateTemplateTask = 
                                await database.models.projectTemplateTasks.create(
                                  _.omit(newProjectTemplateTask, ["_id"])
                                );
                            newTaskId.push(duplicateTemplateTask._id);

                            //duplicate child task
                            if(duplicateTemplateTask.children && duplicateTemplateTask.children.length > 0){

                                let childTaskIdArray = [];
                                let childTaskIds = duplicateTemplateTask.children;
                          
                                if(childTaskIds && childTaskIds.length > 0){

                                    await Promise.all(childTaskIds.map(async childtaskId => {
                                        let childTaskData = await database.models.projectTemplateTasks.findOne(
                                        {
                                            _id : childtaskId
                                        }).lean();
                                        
                                        if(childTaskData){

                                            newProjectTemplateChildTask = {...childTaskData};
                                            newProjectTemplateChildTask.projectTemplateId = duplicateTemplateDocument._id;
                                            newProjectTemplateChildTask.parentId = duplicateTemplateTask._id;
                                            newProjectTemplateChildTask.externalId = childTaskData.externalId +"-"+ UTILS.epochTime();
                                            duplicateChildTemplateTask = 
                                                await database.models.projectTemplateTasks.create(
                                                  _.omit(newProjectTemplateChildTask, ["_id"])
                                                );

                                            childTaskIdArray.push(duplicateChildTemplateTask._id);
                                        }

                                    }))

                                    if(childTaskIdArray && childTaskIdArray.length > 0){

                                        let updateTaskData = 
                                        await database.models.projectTemplateTasks.findOneAndUpdate(
                                        {
                                            _id : duplicateTemplateTask._id
                                        },
                                        {
                                            $set : {
                                                    children : childTaskIdArray
                                            }
                                        }).lean();
                                    }

                                }
                            }
                        }}))
                    }

                    if(newTaskId && newTaskId.length > 0){
                        await database.models.projectTemplates.findOneAndUpdate(
                        {
                            _id : duplicateTemplateDocument._id
                        },
                        {
                            $set : {
                                    tasks : newTaskId
                            }
                        }).lean();
                    }

                await this.ratings(
                    projectTemplateData[0]._id,
                    updateData.rating,
                    userToken
                );

                return resolve({
                    success: true,
                    message : CONSTANTS.apiResponses.DUPLICATE_PROJECT_TEMPLATES_CREATED,
                    data : {
                       _id : duplicateTemplateDocument._id 
                    }
                })
            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
    })
    }


     /**
      * Create ratings.
      * @method
      * @name ratings
      * @param {String} templateId - project template id.
      * @param {String} rating - rating for template.
      * @returns {Object} rating object.
     */

    static ratings( templateId,rating,userToken ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let userProfileData = await kendraService.getProfile(userToken);

                if( !userProfileData.success ) {
                    throw {
                        status : HTTP_STATUS_CODE['bad_request'].status,
                        message : CONSTANTS.apiResponses.USER_PROFILE_NOT_FOUND
                    }
                }

                let templateData = 
                await this.templateDocument({
                    _id : templateId,
                    isReusable : true
                },[
                    "averageRating",
                    "noOfRatings",
                    "ratings"
                ]);

                let updateRating = {
                    ratings : {...templateData[0].ratings}
                };

                updateRating.ratings[rating] += 1;

                let userCurrentRating = 0;
                let projectIndex = -1;

                if( 
                    userProfileData.data &&
                    userProfileData.data.ratings && 
                    userProfileData.data.ratings.length > 0 
                ) {

                    projectIndex = 
                    userProfileData.data.ratings.findIndex(
                        project => project._id.toString() === templateId.toString() 
                    );

                    if( !(projectIndex < 0) ) {
                        userCurrentRating = userProfileData.data.ratings[projectIndex].rating;
                        updateRating.ratings[userCurrentRating] -= 1;
                    }
                } else {
                    userProfileData.data.ratings = [];
                }

                let ratingUpdated = {};

                if( userCurrentRating === rating ) {

                    ratingUpdated = templateData[0];

                } else {

                    let calculateRating = _calculateRating(updateRating.ratings);
                    updateRating.averageRating = calculateRating.averageRating;
                    updateRating.noOfRatings = calculateRating.noOfRatings;
    
                    ratingUpdated = 
                    await database.models.projectTemplates.findOneAndUpdate({
                        _id : templateId
                    },{
                        $set : updateRating
                    }, {
                        new : true
                    });

                    let improvementProjects = [...userProfileData.data.ratings];
                    if( projectIndex >= 0 ) {
                        improvementProjects[projectIndex].rating = rating;
                    } else {
                        improvementProjects.push({
                            _id : ObjectId(templateId),
                            externalId : ratingUpdated.externalId,
                            rating : rating,
                            type : CONSTANTS.common.IMPROVEMENT_PROJECT
                        });
                    }

                    await kendraService.updateUserProfile(
                        userToken,
                        {   
                            "ratings" : improvementProjects
                        }
                    );
                }

                return resolve(
                    _.pick(
                        ratingUpdated,
                        ["averageRating","noOfRatings","ratings"]
                    )
                );

            } catch (error) {
                return resolve({
                    success : false,
                    message : error.message,
                    status : error.status ? error.status : HTTP_STATUS_CODE['internal_server_error'].status
                });
            }
        })
    }

};

/**
 * Calculate average rating and no of ratings.
 * @method
 * @name _calculateRating
 * @param {Object} ratings - Ratings data.
 * @returns {Object} rating object.
*/

function _calculateRating(ratings) {
    let sum = 0;
    let noOfRatings = 0;

    Object.keys(ratings).forEach(rating => {
        sum += rating * ratings[rating];
        noOfRatings += ratings[rating];
    });

    return {
        averageRating : (sum/noOfRatings).toFixed(2),
        noOfRatings : noOfRatings
    } 
}

