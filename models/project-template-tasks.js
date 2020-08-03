/**
 * name : project-template-tasks.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for project template tasks.
 */

module.exports = {
    name: "projectTemplateTasks",
    schema: {
        name : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        createdBy : {
            type : String,
            default : "SYSTEM"
        },
        updatedBy : {
            type : String,
            default : "SYSTEM"
        },
        isDeleted : {
            type : Boolean,
            default : false
        },
        externalId : {
            type : String,
            required : true
        },
        type : {
            type : String,
            required : true
        },
        assessmentDetails : {
            type : Object,
            default : {}
        },
        parentId : "ObjectId",
        projectTemplateId : {
            type : "ObjectId",
            required : true
        },
        isDeleteable : {
            type : Boolean,
            default : false
        },
        taskSequence : {
            type : Array,
            default : []
        },
        children : {
            type : Array,
            default : []
        },
        contentDetails : {
            type : Object,
            default : {}
        },
        improvementProjectDetails : {
            type : Object,
            default : {}
        },
        visibleIf : {
            type : Array,
            default : []
        }
    }
};