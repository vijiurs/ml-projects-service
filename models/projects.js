/**
 * name : projects.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for projects.
 */

module.exports = {
    name: "projects",
    schema: {
        name : String,
        description : String,
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
            default : "SYSTEM"
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
        categories : {
            type : Array,
            default : []
        },
        createdBy : {
            type : String,
            default : "SYSTEM"
        },
        tasks : {
            type : Array,
            default : []
        },
        entityInformation : {
            type : Object,
            default : {}
        },
        programInformation : {
            type : Object,
            default : {}
        },
        solutionInformation : {
            type : Object,
            default : {}
        },
        updatedBy : {
            type : String,
            default : "SYSTEM"
        },
        projectTemplateId : "ObjectId",
        projectTemplateExternalId : String,
        startDate: Date,
        endDate: Date,
        rootOrganisations : {
            type : [String],
            default : []
        },
        resources : {
            type : Array,
            default : []
        }
    }
};