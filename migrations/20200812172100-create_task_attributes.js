const moment = require("moment");

module.exports = {
  async up(db) {
    global.migrationMsg = "Create Project attributes"
    
    let projectAttributes = ["assignedTo"];

    function camelCaseToTitleCase(in_camelCaseString) {
      var result = in_camelCaseString
        .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
        .trim();
      return result.charAt(0).toUpperCase() + result.slice(1);
    }

    let attributes = [];
    projectAttributes.map(attribute => {

      var defaultInput = {
        "externalId": attribute,
        "name": camelCaseToTitleCase(attribute),
        "input": "text",
        "options": [],
        "createdAt": moment().format(),
        "updatedAt": moment().format(),
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
        "isDeleted": false,
        "isVisible": true,
        "status": "active"
      }

      attributes.push(defaultInput); 

    });

    await db.collection('taskAttributes').insertMany(attributes);
    await db.collection('taskAttributes').createIndex({ externalId: 1 },{ unique:true });

  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
