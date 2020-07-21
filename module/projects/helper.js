/**
 * name : helper.js
 * author : Aman
 * created-date : 16-July-2020
 * Description : Projects helper functionality.
 */

/**
    * projectsHelper
    * @class
*/

module.exports = class projectsHelper {

    /**
      * List of projects.
      * @method
      * @name list
      * @returns {Object} Projects.
     */

    static list() {
        return new Promise(async (resolve, reject) => {
            try {

                let result = [{
                    "_id" : ObjectId("5ef9aeff08149c7dfdb1fd6a"),
                    "title" : "Improving Library",
                    "goal" : "Improving Library",
                    "duration" : "1 weeak",
                    "userId" : "e97b5582-471c-4649-8401-3cc4249359bb",
                    "status" : "started",
                    "createdAt" : "2020-06-29T05:38:43.408Z",
                    "lastDownloadedAt" : "2020-06-29T05:38:43.408Z",
                    "syncedAt" : "2020-06-29T05:38:43.408Z",
                    "categories" : [{
                        "name": "Community",
                        "type": "community",
                        "updatedAt": "2020-07-16T09:51:43.533Z",
                        "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2FprojectCategories%2Fdrafts.png?generation=1594893105112980&alt=media"
                    }],
                    "tasks" : {
                        "name" : "task 1",
                        "description" : "task 1 description",
                        "completedAt" : "2020-06-29T05:38:43.408Z",
                        "status" : "completed",
                        "syncedAt" : "2020-06-29T05:38:43.408Z",
                        "createdAt" : "2020-06-29T05:38:43.408Z",
                        "isDeleted" : false,
                        "type" : "single",
                        "subTasks" : [
                            {
                                "name" : "sub task 1",
                                "description" : "sub task 1 description",
                                "startedAt" : "2020-06-29T05:38:43.408Z",
                                "completedAt" : "2020-06-29T05:38:43.408Z",
                                "status" : "pending",
                                "isDeleted" : false,
                                "syncedAt" : "2020-06-29T05:38:43.408Z"                            }
                        ]
                    },
                    "entityInformation" : {
                        "externalId" : "1959076",
                        "addressLine1" : "Jauna Pur, New Delhi-110047",
                        "addressLine2" : "",
                        "administration" : "MCD",
                        "city" : "Urban",
                        "country" : "India",
                        "deleted" : false,
                        "districtId" : "19",
                        "districtName" : "South",
                        "gender" : "Girls",
                        "gpsLocation" : "",
                        "highestGrade" : "5",
                        "lowestGrade" : "0",
                        "name" : "Nigam Pratibha Vidyalaya (Girls), Jauna Pur, New Delhi",
                        "phone" : "",
                        "pincode" : "",
                        "principalName" : "",
                        "shift" : "#N/A",
                        "state" : "Delhi",
                        "totalBoys" : "39",
                        "totalGirls" : "456",
                        "totalStudents" : "495",
                        "zoneId" : "24",
                        "blockId" : "24"
                    },
                    "programInformation" : {
                        "externalId" : "PROGID01",
                        "name" : "DCPCR School Development Index 2018-19",
                        "description" : "DCPCR School Development Index 2018-19",
                        "owner" : "a082787f-8f8f-42f2-a706-35457ca6f1fd",
                        "createdBy" : "a082787f-8f8f-42f2-a706-35457ca6f1fd",
                        "isDeleted" : false,
                        "status" : "active"
                    },
                    "projectTemplateInformation" : {
                        "_id" : ObjectId("5ef9aa6408149c7dfdb1fd67"),
                        "name" : "Template 1",
                        "externalId" : "template-1",
                        "description" : "improving school library",
                        "concepts" : [ 
                            "concept1", 
                            "concept2"
                        ],
                        "keywords" : [ 
                            "keyword1", 
                            "keyword2"
                        ],
                        "status" : "published",
                        "isDeleted" : false,
                        "recommendedFor" : [ 
                            {
                                "roleId" : ObjectId("5d6e521066a9a45df3aa8921"),
                                "code" : "DEO"
                            }
                        ],
                        "createdAt" : "2020-06-29T05:38:43.408Z",
                        "updatedAt" : "2020-06-29T05:38:43.408Z",
                        "createdBy" : "e97b5582-471c-4649-8401-3cc4249359bb",
                        "updatedBy" : "e97b5582-471c-4649-8401-3cc4249359bb",
                        "resources" : [ 
                            {
                                "name" : "Simple routine and you are safe from Corona",
                                "link" : "https://bodh.shikshalokam.org/play/content/do_31298090627997696011602",
                                "app" : "bodh"
                            }, 
                            {
                                "name" : "Activities for parents and children",
                                "link" : "https://bodh.shikshalokam.org/play/collection/do_31303990097832345615414",
                                "app" : "bddh"
                            }, 
                            {
                                "name" : "Simple Tips to parents on engaging children",
                                "link" : "https://bodh.shikshalokam.org/play/collection/do_31303989514924032023932",
                                "app" : "bodh"
                            }, 
                            {
                                "name" : "Virtual Team Building Activities/Energisers",
                                "link" : "https://bodh.shikshalokam.org/play/content/do_31304061711456665615455",
                                "app" : "web"
                            }
                        ],
                        "isReusable" : true,
                        "taskCreationForm" : "defaultTaskCreationForm",
                        "metaInformation" : {
                            "primaryAudience" : [ 
                                "teachers"
                            ],
                            "rationale" : "sample",
                            "risks" : "",
                            "protocols" : "",
                            "vision" : "",
                            "problemDefinition" : "",
                            "prerequisites" : "",
                            "assumptions" : "",
                            "supportingDocuments" : [],
                            "approaches" : [],
                            "successIndicators" : [],
                            "suggestedProject" : ""
                        }
                    },
                    "remarks" : {},
                    "assigneeName" : "user name",
                    "attachments" : []
                }];

                return resolve({
                    message : CONSTANTS.apiResponses.PROJECTS_FETCHED,
                    result : result
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

};


