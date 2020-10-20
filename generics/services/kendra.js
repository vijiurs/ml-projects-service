/**
 * name : kendra.js
 * author : Aman Jung Karki
 * Date : 16-July-2020
 * Description : Kendra service related information.
 */

//dependencies
const request = require('request');
const fs = require("fs");

/**
  * Get downloadable file.
  * @function
  * @name getDownloadableUrl
  * @param {Object} bodyData - body data.
  * @returns {Array} Downloadable file.
*/

const getDownloadableUrl = function (bodyData) {

    let fileDownloadUrl = process.env.KENDRA_APPLICATION_ENDPOINT; 
    
    if ( process.env.CLOUD_STORAGE === "GC" ) {
        fileDownloadUrl = fileDownloadUrl + CONSTANTS.endpoints.DOWNLOADABLE_GCP_URL;
        bodyData.bucketName = process.env.GCP_BUCKET_NAME;
    } else if (process.env.CLOUD_STORAGE === "AWS" ) {
        fileDownloadUrl = fileDownloadUrl + CONSTANTS.endpoints.DOWNLOADABLE_AWS_URL;
        bodyData.bucketName = process.env.AWS_BUCKET_NAME;
    } else {
        fileDownloadUrl = fileDownloadUrl + CONSTANTS.endpoints.DOWNLOADABLE_AZURE_URL;
        bodyData.bucketName = process.env.AZURE_STORAGE_CONTAINER;
    }

    return new Promise((resolve, reject) => {
        try {

            const kendraCallBack = function (err, response) {
                if (err) {
                    return reject({
                        status : HTTP_STATUS_CODE.bad_request.status,
                        message : CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    let downloadableImage = response.body;
                    return resolve(downloadableImage);
                }
            }

            request.post(fileDownloadUrl, {
                headers: {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                },
                json : bodyData
            }, kendraCallBack);

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Upload file.
  * @function
  * @name upload
  * @param {String} file - file to upload.
  * @param {String} filePath - Upload file in path.
  * @returns {Array} upload file.
*/

const upload = function (file,filePath) {

    let fileUploadUrl = process.env.KENDRA_APPLICATION_ENDPOINT; 
    let bucketName = "";

    if ( process.env.CLOUD_STORAGE === "GC" ) {
        fileUploadUrl = fileUploadUrl + "api/v1/cloud-services/gcp/uploadFile";
        bucketName = process.env.GCP_BUCKET_NAME;
    } else if( process.env.CLOUD_STORAGE === "AWS" ) {
        fileUploadUrl = fileUploadUrl + "api/v1/cloud-services/aws/uploadFile";
        bucketName = process.env.AWS_BUCKET_NAME;
    } else {
        fileUploadUrl = fileUploadUrl + "api/v1/cloud-services/azure/uploadFile";
        bucketName = process.env.AZURE_STORAGE_CONTAINER;
    }

    return new Promise((resolve, reject) => {
        try {

            const kendraCallBack = function (err, response) {
                if (err) {
                    return reject({
                        status : HTTP_STATUS_CODE.bad_request.status,
                        message : CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    })
                } else {
                    let uploadedData = response.body;
                    return resolve(uploadedData);
                }
            }

            let formData = request.post(fileUploadUrl,{
                headers: {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                }
            },kendraCallBack);

            let form = formData.form();
            form.append("filePath",filePath);
            form.append("bucketName",bucketName);
            form.append("file",fs.createReadStream(file));

        } catch (error) {
            return reject(error);
        }
    });
}

/**
  * List of solutions
  * @function
  * @name solutionDocuments
  * @param {Object} filterData - Filter data.
  * @param {Array} projection - Projected data. 
  * @param {Array} skipFields - Field to skip.  
  * @returns {JSON} - List of solutions
*/

const solutionDocuments = function ( 
    filterData =  "all",
    projection = "all",
    skipFields = "none"
) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.LIST_SOLUTIONS;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                },
                json : {
                    query : filterData,
                    projection : projection,
                    skipFields : skipFields
                }
            };

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * List of entity types.
  * @function
  * @name entityTypesDocuments
  * @param {Object} filterData - Filter data.
  * @param {Array} projection - Projected data. 
  * @param {Array} skipFields - Field to skip.  
  * @returns {JSON} - List of entity types.
*/

const entityTypesDocuments = function ( 
    filterData =  "all",
    projection = "all",
    skipFields = "none"
) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.LIST_ENTITY_TYPES;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                },
                json : {
                    query : filterData,
                    projection : projection,
                    skipFields : skipFields
                }
            };

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * List of roles data.
  * @function
  * @name rolesDocuments
  * @param {Object} filterData - Filter data.
  * @param {Array} projection - Projected data. 
  * @param {Array} skipFields - Field to skip.  
  * @returns {JSON} - List of roles data.
*/

const rolesDocuments = function ( 
    filterData =  "all",
    projection = "all",
    skipFields = "none"
) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.LIST_USER_ROLES;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                },
                json : {
                    query : filterData,
                    projection : projection,
                    skipFields : skipFields
                }
            };

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * List of forms.
  * @function
  * @name formsDocuments
  * @param {Object} filterData - Filter data.
  * @param {Array} projection - Projected data. 
  * @param {Array} skipFields - Field to skip.
  * @returns {JSON} - List of forms.
*/

const formsDocuments = function ( 
    filterData =  "all",
    projection = "all",
    skipFields = "none"
) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.LIST_FORMS;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                },
                 json : {
                    query : filterData,
                    projection : projection,
                    skipFields : skipFields
                }
            };

            request.get(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * List of entity data.
  * @function
  * @name entityDocuments
  * @param {Object} filterData - Filter data.
  * @param {Array} projection - Projected data. 
  * @returns {JSON} - List of entity data.
*/

const entityDocuments = function ( 
    filterData =  "all",
    projection = "all",
    skipFields = "none"
) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.LIST_ENTITIES;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                },
                json : {
                    query : filterData,
                    projection : projection,
                    skipFields : skipFields
                }
            };

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * List of programs.
  * @function
  * @name programsDocuments
  * @param {Object} filterData - Filter data.
  * @param {Array} projection - Projected data. 
  * @param {Array} skipFields - Field to skip.
  * @returns {JSON} - List of programs.
*/

const programsDocuments = function ( 
    filterData =  "all",
    projection = "all",
    skipFields = "none" 
) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.FIND_PROGRAMS;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                },
                json : {
                    query : filterData,
                    projection : projection,
                    skipFields : skipFields
                }
            };

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN,
                        result : []
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Create user program and solution.
  * @function
  * @name createUserProgramAndSolution
  * @param {string} userId - logged in user id.
  * @param {Object} data - Program and solution creation data. 
  * @returns {JSON} - Create user program and solution.
*/

const createUserProgramAndSolution = function ( data,userToken ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.CREATE_PROGRAM_AND_SOLUTION;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "X-authenticated-user-token" : userToken
                },
                json : data
            };

            request.get(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                    return resolve({
                        success : false
                    });
                } else {
                    return resolve({
                        success : true,
                        data : data.body.result
                    });
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * User extension get profile.
  * @function
  * @name getProfile
  * @param {String} token - Logged in user token.
  * @returns {JSON} - User extension get profile.
*/

const getProfile = function ( token ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.USER_EXTENSION_GET_PROFILE;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token
                }
            };

            request.get(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(JSON.parse(data.body));
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Update user rating.
  * @function
  * @name updateUserProfile
  * @param {String} token - Logged in user token.
  * @param {Object} updateData - Update data.
  * @returns {JSON} - Update user rating.
*/

const updateUserProfile = function ( token,updateData ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.USER_EXTENSION_UPDATE_USER_PROFILE;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token
                },
                json : updateData
            };

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * List of user private programs.
  * @function
  * @name userPrivatePrograms
  * @param {String} token - Logged in user token.
  * @param {String} userId - Logged in user id.
  * @returns {JSON} - List of user private programs.
*/

const userPrivatePrograms = function ( token ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.USER_PRIVATE_PROGRAMS;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token
                }
            };

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return resolve({
                        success : false
                    });
                } else {
                    
                    return resolve({
                        success : true,
                        data : JSON.parse(data.body).result
                    });
                }
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
  * @returns {JSON} - Update solutions.
*/

const updateSolution = function ( token,updateData,solutionExternalId ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
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

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                     return reject({
                        message: CONSTANTS.apiResponses.KENDRA_SERVICE_DOWN,
                        result : []
                    });
                } else {
                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

/**
  * Update solution
  * @function
  * @name getUserOrganisationsAndRootOrganisations
  * @param {String} token - Logged in user token.
  * @returns {JSON} - Update solutions.
*/

const getUserOrganisationsAndRootOrganisations = function ( token ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = 
            process.env.KENDRA_APPLICATION_ENDPOINT + process.env.URL_PREFIX + 
            CONSTANTS.endpoints.GET_USER_ORGANISATIONS;

            const options = {
                headers : {
                    "content-type": "application/json",
                    AUTHORIZATION : process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : token
                }
            };

            request.post(url,options,samikshaCallback);

            function samikshaCallback(err, data) {

                if (err) {
                    return resolve({
                        success : false
                    });
                } else {
                    return resolve({
                        success : true,
                        data : JSON.parse(data.body).result
                    });
                }
            }

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    getDownloadableUrl : getDownloadableUrl,
    upload : upload,
    solutionDocuments : solutionDocuments,
    entityTypesDocuments : entityTypesDocuments,
    rolesDocuments : rolesDocuments,
    formsDocuments : formsDocuments,
    entityDocuments: entityDocuments,
    programsDocuments : programsDocuments,
    createUserProgramAndSolution : createUserProgramAndSolution,
    getProfile : getProfile,
    updateUserProfile : updateUserProfile,
    userPrivatePrograms : userPrivatePrograms,
    updateSolution : updateSolution,
    getUserOrganisationsAndRootOrganisations : getUserOrganisationsAndRootOrganisations 
};

