/**
 * name : project-templates.js.
 * author : Aman Karki.
 * created-date : 13-July-2020.
 * Description : Schema for project templates.
 */
module.exports = {
    name: "projectTemplates",
    schema: {
        name : {
            type : String,
            required : true
        },
        externalId : {
            type : String,
            required : true
        },
        categories : {
            type : Array,
            default : []
        },
        description : {
            type : String,
            required : true
        },
        concepts : {
            type : Array,
            default : []
        },
        keywords : {
            type : Array,
            default : []
        },
        status : {
            type : String,
            required : true
        },
        isDeleted : {
            type : Boolean,
            default : false
        },
        recommendedFor : {
            type : Array,
            default : [] 
        },
        tasks : {
            type : Array,
            default : []
        },
        createdBy : {
            type : String,
            default : "SYSTEM"
        },
        updatedBy : {
            type : String,
            default : "SYSTEM"
        },
        resources : {
            type : Array,
            default : []
        },
        isReusable : {
            type : Boolean,
            default : false
        },
        entityType : {
            type : String,
            required : true
        },
        entityTypeId : {
            type : "ObjectId",
            required : true
        },
        taskSequence : {
            type : Array,
            default : []
        },
        taskCreationForm : {    
            type : String,
            required : true
        },
        metaInformation : {
            type : Object,
            default : {}
        },
        parentTemplateId : "ObjectId",
        solutionId : "ObjectId",
        solutionExternalId : String,
        programId : "ObjectId",
        programExternalId : String,
        averageRating : {
            type : Number,
            default : 0
        },
        noOfRatings : {
            type : Number,
            default : 0
        },
        ratings : {
            type : Object,
            default : {
                1 : 0,
                2 : 0,
                3 : 0,
                4 : 0,
                5 : 0
            }
        }
    }
};