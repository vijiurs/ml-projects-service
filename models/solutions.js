/**
 * name : solutions.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for solutions.
 */

module.exports = {
  name: "solutions",
  schema: {
    resourceType : {
      type : Array,
      default : []
    },
    language: {
      type : Array,
      default : []
    },
    keywords: {
      type : Array,
      default : []
    },
    concepts : {
      type : Array,
      default : []
    },
    createdFor: {
      type : Array,
      default : []
    },
    externalId : {
      type : String,
      required : true
    },
    isReusable : {
      type : Boolean,
      default : false
    },
    name : {
      type : String,
      required : true
    },
    description : {
      type : String,
      required : true
    },
    author : {
      type : String,
      required : true
    },
    type : {
      type : String,
      required : true
    },
    entityType: {
      type : String,
      required : true
    },
    entityTypeId : {
      type : "ObjectId",
      required : true
    },
    status : {
      type : String,
      default : "active"
    },
    isDeleted : {
      type : Boolean,
      default : false
    },
    programId : {
      type : "ObjectId",
      required : true
    },
    programExternalId : {
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
    },
    createdBy : {
      type : String,
      default : "SYSTEM"
    },
    updatedBy : {
      type : String,
      default : "SYSTEM"
    }
  }
};
