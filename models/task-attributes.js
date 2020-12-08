/**
 * name : task-attributes.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for task attributes.
 */

module.exports = {
    name: "taskAttributes",
    schema: {
        externalId : {
            type : String,
            required : true,
            unique: true
            
        },
        name : {
            type : String,
            required : true
        },
        input : {
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
        isVisible : {
            type : Boolean,
            default : true
        },
        status : {
            type : String,
            default : "active"
        }
    }
};