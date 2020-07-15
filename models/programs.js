/**
 * name : programs.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for programs.
 */

module.exports = {
  name: "programs",
  schema: {
    externalId : {
      type : String,
      required : true
    },
    name : {
      type : String,
      required : true
    },
    description : {
      type : String,
      required : true
    },
    owner: {
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
    status : {
      type : String,
      default : "active"
    },
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
    imageCompression: {
      type : Object,
      default : {}
    },
    components : {
      type : Array,
      default : []
    },
    isAPrivateProgram : {
      type : Boolean,
      default : false
    }
  }
};
