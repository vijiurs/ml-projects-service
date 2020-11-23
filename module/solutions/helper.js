/**
 * name : helper.js
 * author : Aman
 * created-date : 18-Nov-2020
 * Description : Solutions related helper functionality
 */

// Dependencies

const userProjectsHelper = require(MODULES_BASE_PATH + "/userProjects/helper");
const assessmentService = require(GENERICS_FILES_PATH + "/services/assessment");
const kendraService = require(GENERICS_FILES_PATH + "/services/kendra");

/**
    * SolutionsHelper
    * @class
*/

module.exports = class SolutionsHelper {

    /**
    * Solutions details
    * @method
    * @name details 
    * @param {String} userToken - Logged in user token.
    * @param {String} projectId - Project id.
    * @param {Array} taskId - Tasks id.
    * @returns {Object}
   */

    static details( userToken,projectId,taskId ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let project = await userProjectsHelper.projectDocument(
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
                    return resolve({
                        message : CONSTANTS.apiResponses.USER_PROJECT_NOT_FOUND,
                        result : {}
                    })
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
                            projectId,
                            taskId
                        );
                        
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
                    message : CONSTANTS.apiResponses.TASKS_STATUS_FETCHED,
                    result : assessmentOrObservationData
                });

            } catch (error) {
                return reject(error);
            }
        })
    }
    
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

function _assessmentDetails( userToken,solutionDetails,entityId,programId,projectId,taskId ) {
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
                        projectId : projectId,
                        taskId : taskId
                    }
                );

            } else {

                result = await assessmentService.addEntityToAssessmentSolution(
                    userToken,
                    solutionDetails._id,
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

                result["data"]["_id"] = solutionDetails._id;

            }

            return resolve(result);
        } catch(error) {
            return reject(error);
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

// <- TODO :: LOGIC SHOULD CHECK PROPERLY