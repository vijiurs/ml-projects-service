/**
 * name : projects.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for projects.
 */

module.exports = {
    name: "projects",
    schema: {
        taskReport : {
            type : Object,
            default : {}
        },
        metaInformation : {
            type : Object,
            default : {}
        },
        userId : {
            type : String,
            required : true
        },
        createdFor : {
            type : Array,
            default : []
        },
        status : {
            type : String,
            required : true
        },
        lastDownloadedAt : Date,
        syncedAt : Date,
        isDeleted : {
            type : Boolean,
            default : false
        },
        category : {
            type : Array,
            default : []
        },
        createdBy : {
            type : String,
            default : "SYSTEM"
        },
        startedAt : Date,
        tasks : {
            type : Array,
            default : []
        },
        entityId : {
            type : "ObjectId",
            required : true
        },
        entityExternalId : {
            type : String,
            required : true
        },
        entityInformation : {
            type : Object,
            default : {}
        },
        solutionId : {
            type : "ObjectId",
            required : true
        },
        solutionExternalId : {
            type : String,
            required : true
        },
        entityTypeId : {
            type : "ObjectId",
            required : true
        },
        programId : {
            type : "ObjectId",
            required : true
        },
        programExternalId : {
            type : String,
            required : true
        },
        programInformation : {
            type : Object,
            default : {}
        },
        updatedBy : {
            type : String,
            default : "SYSTEM"
        },
        externalId : {
            type : String,
            required : true
        },
        projectTemplateId : {
            type : "ObjectId",
            required : true
        },
        projectTemplateExternalId : {
            type : String,
            required : true
        }
    }
};