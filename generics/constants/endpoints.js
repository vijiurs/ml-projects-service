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
    CREATE_PROGRAM_AND_SOLUTION : "/users/createProgramAndSolution",
    LIST_ENTITIES : "/entities/listByIds",
    USER_EXTENSION_GET_PROFILE : "/user-extension/getProfile",
    USER_EXTENSION_UPDATE_USER_PROFILE : "/user-extension/update",
    USER_PRIVATE_PROGRAMS : "/users/privatePrograms",
    UPDATE_SOLUTIONS : "/solutions/updateSolutions",
    LIST_PROGRAMS : "/programs/list",
    GET_USER_ORGANISATIONS : "/users/getUserOrganisationsAndRootOrganisations",
    PRESIGNED_GCP_URL : "api/v1/cloud-services/gcp/preSignedUrls", // Kendra service
    PRESIGNED_AWS_URL : "api/v1/cloud-services/aws/preSignedUrls", // Kendra service
    PRESIGNED_AZURE_URL : "api/v1/cloud-services/azure/preSignedUrls", // Kendra service,
    VIEW_PROJECT_REPORT : "api/v1/improvement-project/viewProjectReport", // dhiti service
    ENTITY_REPORT : "api/v1/improvement-project/entityReport", // dhiti service
    ASSESSMENTS_CREATE : "/assessments/create", // Should be kendra as api is not build checked for assessment
    OBSERVATION_CREATE : "/observations/create",
    ADD_ENTITY_TO_OBSERVATIONS : "/observations/addEntityToObservation",
    ADD_ENTITIES_TO_SOLUTIONS : "/solutions/addEntities",
    UPDATE_OBSERVATION : "/observations/update",
    LIST_OBSERVATIONS : "/observations/list",
    CREATE_ENTITY_ASSESSORS : "/entityAssessors/create",
    CREATE_OBSERVATIONS : "/observations/create",
    DETAILS_FORM : "/forms/details",
    GET_USERS_BY_ENTITY_AND_ROLE : "/entities/getUsersByEntityAndRole", //Kendra service
    LIST_PROGRAMS_BY_IDS : "/programs/listByIds",
    REMOVE_SOLUTIONS_FROM_PROGRAM : "/programs/removeSolutions",
    REMOVE_ENTITY_FROM_SOLUTION : "/solutions/removeEntities",
    USER_TARGETED_SOLUTIONS : "/solutions/autoTargeted"
};
