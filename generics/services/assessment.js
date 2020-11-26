/**
 * name : assessment.js
 * author : Aman Jung Karki
 * Date : 21-Nov-2020
 * Description : Assessment service related information.
 */

 //dependencies
const request = require('request');

const ASSESSMENT_URL = process.env.ASSESSMENT_APPLICATION_ENDPOINT + process.env.ASSESSMENT_BASE_URL;

/**
  * Assessment create
  * @function
  * @name createAssessmentSolutionFromTemplate
  * @param {String} token - logged in user token.
  * @param {String} templateId - template id.
  * @param {Object} bodyData - Body data
  * @returns {JSON} - Create assessment from template solution.
*/

const createAssessmentSolutionFromTemplate = function (token,templateId,bodyData) {
    return new Promise(async (resolve, reject) => {
        try {

            let assessmentCreateUrl =  
            ASSESSMENT_URL + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.ASSESSMENTS_CREATE + "?solutionId=" + templateId;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token,
                },
                json : bodyData
            };
            
            request.post(assessmentCreateUrl,options,assessmentCallback);

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };
                
                if (err) {
                    result.success = false;
                } else {

                    let response = data.body;
                    if( response.status === HTTP_STATUS_CODE['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Create Observation
  * @function
  * @name createObservationFromSolutionTemplate
  * @param {String} token - logged in user token.
  * @param {String} templateId - template id.
  * @param {Object} bodyData - Body data
  * @returns {JSON} - Create assessment from template solution.
*/

const createObservationFromSolutionTemplate = function (token,templateId,bodyData) {
    return new Promise(async (resolve, reject) => {
        try {

            let observationCreateUrl =  
            ASSESSMENT_URL + "api/v2" + 
            CONSTANTS.endpoints.OBSERVATION_CREATE + "?solutionId=" + templateId;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token,
                },
                json : bodyData
            };
            
            request.post(observationCreateUrl,options,assessmentCallback);

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };
                if (err) {
                    result.success = false;
                } else {
                    
                    let response = data.body;
                    if( response.status === HTTP_STATUS_CODE['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Add entity to observation
  * @function
  * @name addEntityToObservation
  * @param {String} token - logged in user token.
  * @param {String} observationId - template id.
  * @param {Object} bodyData - Body data
  * @returns {JSON} - Create assessment from template solution.
*/

/**
  * Add entity to assessment solution
  * @function
  * @name addEntityToAssessmentSolution
  * @param {String} token - logged in user token.
  * @param {String} solutionId - solution id.
  * @param {Object} bodyData - Body data
  * @returns {JSON} - Add entity to assessment solution.
*/

const addEntityToAssessmentSolution = function (token,solutionId,bodyData) {
    return new Promise(async (resolve, reject) => {
        try {

            let assessmentCreateUrl =  
            ASSESSMENT_URL + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.ADD_ENTITIES_TO_SOLUTIONS + "/" + solutionId;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token,
                },
                json : {
                    "entities" : bodyData
                }
            };
            
            request.post(assessmentCreateUrl,options,assessmentCallback);

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };
                
                if (err) {
                    result.success = false;
                } else {
                    
                    let response = data.body;
                    if( response.status === HTTP_STATUS_CODE['ok'].status ) {
                        result["data"] = response.result ? response.result : {};
                    } else {
                        result.success = false;
                    }

                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Add entity to observation
  * @function
  * @name addEntityToObservation
  * @param {String} token - logged in user token.
  * @param {String} observationId - observation id.
  * @param {Object} bodyData - Body data
  * @returns {JSON} - Add entity to observation.
*/

const addEntityToObservation = function (token,observationId,bodyData) {
    return new Promise(async (resolve, reject) => {
        try {

            let addEntityToObservationUrl =  
            ASSESSMENT_URL + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.ADD_ENTITY_TO_OBSERVATIONS + "/" + observationId;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token,
                },
                json : {
                    data : bodyData
                }
            };
            
            request.post(addEntityToObservationUrl,options,assessmentCallback);

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {

                    let response = data.body;
                    if( response.status === HTTP_STATUS_CODE['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                    
                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Create entity assessors
  * @function
  * @name createEntityAssessors
  * @param {String} token - logged in user token.
  * @param {String} programId - program id.
  * @param {String} solutionId - solution id.
  * @param {Array} entities - Entities data
  * @returns {JSON} - Add entity to observation.
*/

const createEntityAssessors = function (token,programId,solutionId,entities) {
    return new Promise(async (resolve, reject) => {
        try {

            let createdEntityAssessor =  
            ASSESSMENT_URL + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.CREATE_ENTITY_ASSESSORS + "/" + programId + "?solutionId=" + solutionId;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token,
                },
                json : {
                    entities : entities
                }
            };
            
            request.post(createdEntityAssessor,options,assessmentCallback);

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {

                    let response = data.body;
                    if( response.status === HTTP_STATUS_CODE['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                    
                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Details observation
  * @function
  * @name observationDetails
  * @param {String} token - logged in user token.
  * @param {String} observationId - observation id.
  * @returns {JSON} - Add entity to observation.
*/

const observationDetails = function (token,observationId) {
    return new Promise(async (resolve, reject) => {
        try {

            let url =  
            ASSESSMENT_URL + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.OBSERVATION_DETAILS + "/" + observationId;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token,
                }
            };
            
            request.get(url,options,assessmentCallback);

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {

                    let response = data.body;
                    if( response.status === HTTP_STATUS_CODE['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                    
                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * List of solutions
  * @function
  * @name listSolutions
  * @param {Array} solutionIds - solution external ids. 
  * @returns {JSON} - List of solutions
*/

const listSolutions = function (solutionIds) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = ASSESSMENT_URL + process.env.URL_PREFIX + CONSTANTS.endpoints.LIST_SOLUTIONS;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                },
                json : {
                    solutionIds : solutionIds
                }
            };

            request.post(url,options,assessmentCallback);

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {
                    let response = data.body;

                    if( response.status === HTTP_STATUS_CODE['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                }

                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Update solution
  * @function
  * @name updateSolution
  * @param {String} token - Logged in user token.
  * @param {Object} updateData - Data to update.
  * @param {Object} solutionExternalId - External id of solution.  
  * @returns {JSON} - Update solutions.
*/

const updateSolution = function ( token,updateData,solutionExternalId ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            ASSESSMENT_URL + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.UPDATE_SOLUTIONS + "?solutionExternalId=" + solutionExternalId;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token
                },
                json : updateData
            };

            request.post(url,options,assessmentCallback);

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {

                    let response = data.body;

                    if( response.status === HTTP_STATUS_CODE['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                    
                    result["data"] = data.body;
                }

                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    createAssessmentSolutionFromTemplate : createAssessmentSolutionFromTemplate,
    createObservationFromSolutionTemplate : createObservationFromSolutionTemplate,
    addEntityToObservation : addEntityToObservation,
    addEntityToAssessmentSolution : addEntityToAssessmentSolution,
    createEntityAssessors : createEntityAssessors,
    observationDetails : observationDetails,
    listSolutions : listSolutions,
    updateSolution : updateSolution
}