/**
 * name : api-responses.js
 * author : Aman Karki
 * Date : 16-July-2020
 * Description : All api response messages.
 */

module.exports = {
    GET_IMPROVEMENT_PROJECTS : "api/v1/template/getImprovementProjects", // Unnati service
    DOWNLOADABLE_GCP_URL : "api/v1/cloud-services/gcp/getDownloadableUrl", // Kendra service
    DOWNLOADABLE_AWS_URL : "api/v1/cloud-services/aws/getDownloadableUrl", // Kendra service
    DOWNLOADABLE_AZURE_URL : "api/v1/cloud-services/azure/getDownloadableUrl", // Kendra service
    VERIFY_TOKEN: "/token/verify", // Call to sunbird service 
    SOLUTION_EXTERNAL_IDS_TO_INTERNAL_IDS : "/solutions/externalIdsToInternalIds",
    LIST_SOLUTIONS : "/solutions/list",
    LIST_USER_ROLES : "/user-roles/list",
    LIST_ENTITY_TYPES : "/entity-types/list",
    LIST_FORMS : "/forms/list",
    CREATE_PROGRAM_AND_SOLUTION : "/users/createProgramAndSolution",
    LIST_ENTITIES : "/entities/list",
    USER_EXTENSION_GET_PROFILE : "/user-extension/getProfile",
    USER_EXTENSION_UPDATE_USER_PROFILE : "/user-extension/update",
    USER_PRIVATE_PROGRAMS : "/users/privatePrograms",
    UPDATE_SOLUTIONS : "/solutions/updateSolutions",
    LIST_PROGRAMS : "/programs/list"
};
