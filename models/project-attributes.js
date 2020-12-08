/**
 * name : project-attributes.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for project attributes.
 */

module.exports = {
    name: "projectAttributes",
    schema: {

        externalId : {
            type : String,
            required : true,
            index: true,
            unique: true
            
        },
        name : {
            type : String,
            required : true,
            index: true
        },
        input : {
            type : String,
            required : true
        },
        options : {
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