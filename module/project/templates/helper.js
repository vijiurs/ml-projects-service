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

const projectCategoriesHelper = 
require(MODULES_BASE_PATH + "/project/categories/helper");

const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");

const entityTypesHelper = require(MODULES_BASE_PATH + "/entity-types/helper");

const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");

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
      * @method csvData {Object} - csv data.
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
                    await projectCategoriesHelper.categoryDocuments({
                        externalId : { $in : categoryIds }
                    },["externalId"]);

                    categoriesData = categories.reduce((ac,category)=> ({
                        ...ac,
                        [category.externalId] : {
                            _id : ObjectId(category._id),
                            externalId : category.externalId
                        }
                    }),{});
                }

                let recommendedFor = {};

                if( roleIds.length > 0 ) {

                    let userRolesData = 
                    await userRolesHelper.rolesDocuments({
                        code : { $in : roleIds }
                    },["code"]);

                    recommendedFor = userRolesData.reduce((ac,role)=> ({
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
                    await entityTypesHelper.entityTypesDocuments({
                        name : { $in : entityTypes }
                    });

                    entityTypesData = entityTypesDocument.reduce((ac,entityType)=> ({
                        ...ac,
                        [entityType.name] : {
                            _id : ObjectId(entityType._id),
                            name : entityType.name
                        }
                    }),{});

                }

                return resolve({
                    categories : categoriesData,
                    roles : recommendedFor,
                    entityTypes : entityTypesData
                });

            } catch(error) {
                return reject(error);
            }
        })
    }

     /**
      * Template data.
      * @method
      * @name templateData
      * @method data {Object} - csv data.
      * @method csvInformation {Object} - csv information.
      * @returns {Object} Template data.
     */

    static templateData(data,csvInformation) {
        return new Promise(async (resolve, reject) => {
            try {

                let templatesDataModel = Object.keys(schemas["project-templates"].schema);
                let parsedData = UTILS.valueParser(data);
                delete parsedData._arrayFields;

                let categories = [];
                if( parsedData.categories && parsedData.categories.length > 0 ) {
                    parsedData.categories.forEach(category=>{
                        if( csvInformation.categories[category] ) {
                            return categories.push(
                                csvInformation.categories[category]
                            );
                        }
                    });
                }

                parsedData.categories = categories;

                let tasks = [];

                if( parsedData.tasks && parsedData.tasks.length > 0 ) {
                    
                    parsedData.tasks.forEach(task=>{
                        if( csvInformation.tasks[task] ) {
                            tasks.push(csvInformation.tasks[task]);
                        }
                    });
                }

                parsedData.tasks = tasks;
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

                parsedData.resources = [];

                for ( let resourceCount = 1 ; resourceCount < 20 ; resourceCount++ ) {
                    
                    let resource = "resources" + resourceCount;
                    
                    if( parsedData[resource] ) {
                        let resourceData = parsedData[resource].split(",");
                        
                        parsedData.resources.push({
                            name : resourceData[0],
                            link : resourceData[1],
                            app : resourceData[2]
                        });

                        delete parsedData[resource];
                    }

                }

                parsedData.metaInformation = {};
                let booleanData = UTILS.getAllBooleanDataFromModels(schemas["project-templates"].schema);

                Object.keys(parsedData).forEach(eachParsedData=>{
                    if( !templatesDataModel.includes(eachParsedData) ) {
                        parsedData.metaInformation[eachParsedData] = parsedData[eachParsedData];
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
      * @param templates - csv templates data.
      * @param userId - logged in user id.
      * @returns {Object} Project templates.
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

                for ( let template = 0; template < templates.length ; template ++ ) {

                    let currentData = templates[template];
                    
                    let templateData = 
                    await this.templateDocument({
                        externalId : currentData.externalId,
                        isReusable : true
                    },["_id"]);

                    if( templateData.length > 0 && templateData[0]._id ) {
                        currentData["_SYSTEM_ID"] = CONSTANTS.apiResponses.PROJECT_TEMPLATE_EXISTS;
                    } else {

                        let templateData = await this.templateData(
                            currentData,
                            csvInformation,
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

                            if( createdTemplate.tasks && createdTemplate.tasks.length > 0 ) {
                                await database.models.projectTemplateTasks.updateMany({
                                    _id : { 
                                        $in : createdTemplate.tasks 
                                    }},{ 
                                        $set : { projectTemplateId : createdTemplate._id} 
                                    }
                                );
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
      * @param templates - csv templates data.
      * @param userId - logged in user id.
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

                for ( let template = 0; template < templates.length ; template ++ ) {

                    let currentData = templates[template];

                    if ( !currentData._SYSTEM_ID ) {
                        currentData["UPDATE_STATUS"] = CONSTANTS.apiResponses.MISSING_PROJECT_TEMPLATE_ID;
                    } else {

                        let templateData = 
                        await this.templateDocument({
                            _id : currentData._SYSTEM_ID
                        },["_id"]);

                        if ( !(templateData.length > 0 && templateData[0]._id) ) {
                            currentData["UPDATE_STATUS"] = constants.apiResponses.PROJECT_TEMPLATE_NOT_FOUND;
                        } else {
                                
                            let templateData = await this.templateData(
                                currentData,
                                csvInformation,
                                userId
                            );

                            templateData.updatedBy = userId;

                            let updatedTemplate = 
                            await database.models.projectTemplates.findOneAndUpdate({
                                _id : currentData._SYSTEM_ID
                            },{
                                $set : templateData
                            },{
                                    new : true
                            });

                            currentData["UPDATE_STATUS"] = CONSTANTS.common.SUCCESS;

                            if( 
                                updatedTemplate.tasks && 
                                updatedTemplate.tasks.length > 0 
                            ) {
                                
                                await database.models.projectTemplateTasks.updateMany({
                                    _id : { 
                                        $in : updatedTemplate.tasks 
                                    }},{ 
                                        $set : { projectTemplateId : updatedTemplate._id} 
                                    }
                                );
                            }

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
      * @name importFromTemplates - import templates from existing project templates.
      * @param {String} templateId - project template id.
      * @param {String} solutionId - solution id.
      * @param {Object} updateData - template update data.
      * @returns {Object} imported templates data.
     */

    static importFromTemplates( templateId,solutionId,updateData = {} ) {
        return new Promise(async (resolve, reject) => {
            try {

                let projectTemplateData = 
                await this.templateDocument({
                    externalId : templateId,
                    isReusable : true
                });

                if ( !projectTemplateData.length > 0 ) {
                    throw {
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND
                    }
                }

                let solutionData = 
                await solutionsHelper.solutionDocuments({
                    externalId : solutionId
                },["_id","externalId","programId","programExternalId"]);

                if( !solutionData.length > 0 ) {
                    throw {
                        message : CONSTANTS.apiResponses.SOLUTION_NOT_FOUND
                    }
                }

                let newProjectTemplates = {...projectTemplateData[0]};
                newProjectTemplates.externalId = 
                projectTemplateData[0].externalId +"-"+ UTILS.epochTime();

                newProjectTemplates.solutionId = solutionData[0]._id;
                newProjectTemplates.solutionExternalId = solutionData[0].externalId;
                newProjectTemplates.programId = solutionData[0].programId;
                newProjectTemplates.programExternalId = solutionData[0].programExternalId;
                newProjectTemplates.parentTemplateId = projectTemplateData[0]._id;

                let updationKeys = Object.keys(updateData);

                if( updationKeys.length > 0 ) {

                    updationKeys.forEach(singleKey=>{
                        if( newProjectTemplates[singleKey] ) {
                            newProjectTemplates[singleKey] = updateData[singleKey];
                        }
                    })

                }

                let duplicateTemplateDocument = 
                await database.models.projectTemplates.create(
                  _.omit(newProjectTemplates, ["_id"])
                );

                if ( !duplicateTemplateDocument._id ) {
                    throw {
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATES_NOT_CREATED
                    }
                }

                return resolve({
                    message : CONSTANTS.apiResponses.DUPLICATE_PROJECT_TEMPLATES_CREATED,
                    result : {
                       _id : duplicateTemplateDocument._id 
                    }
                })
            } catch (error) {
                return reject(error);
            }
        })
    }

};


