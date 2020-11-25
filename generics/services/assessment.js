/**
 * name : assessment.js
 * author : Aman Jung Karki
 * Date : 21-Nov-2020
 * Description : Assessment service related information.
 */

 //dependencies
const request = require('request');

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
            process.env.ASSESSMENT_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
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
            process.env.ASSESSMENT_APPLICATION_ENDPOINT + "api/v2" + 
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
  * @returns {JSON} - Create assessment from template solution.
*/

const addEntityToAssessmentSolution = function (token,solutionId,bodyData) {
    return new Promise(async (resolve, reject) => {
        try {

            let assessmentCreateUrl =  
            process.env.ASSESSMENT_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
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

const addEntityToObservation = function (token,observationId,bodyData) {
    return new Promise(async (resolve, reject) => {
        try {

            let addEntityToObservationUrl =  
            process.env.ASSESSMENT_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
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

module.exports = {
    createAssessmentSolutionFromTemplate : createAssessmentSolutionFromTemplate,
    createObservationFromSolutionTemplate : createObservationFromSolutionTemplate,
    addEntityToObservation : addEntityToObservation,
    addEntityToAssessmentSolution : addEntityToAssessmentSolution
}