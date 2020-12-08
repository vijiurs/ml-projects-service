module.exports = {
  async up(db) {
    
    global.migrationMsg = "Uploaded Project categories";
    const kendraServiceHelper = require("../generics/services/kendra");

    let projectCategories = [
      {
        name : "Teachers",
        externalId : "teachers",
        createdAt : new Date(),
        updatedAt : new Date(),
        updatedBy : "SYSTEM",
        createdBy : "SYSTEM",
        icon : "teacher.png",
        isDeleted : false,
        isVisible : true,
        status : "active"
      },
      {
        name : "Students",
        externalId : "students",
        createdAt : new Date(),
        updatedAt : new Date(),
        updatedBy : "SYSTEM",
        createdBy : "SYSTEM",
        icon : "students.png",
        isDeleted : false,
        isVisible : true,
        status : "active"
      },
      {
        name : "Infrastructure",
        externalId : "infrastructure",
        createdAt : new Date(),
        updatedAt : new Date(),
        updatedBy : "SYSTEM",
        createdBy : "SYSTEM",
        icon : "infrastructure.png",
        isDeleted : false,
        isVisible : true,
        status : "active"
      },
      {
        name : "Community",
        externalId : "community",
        createdAt : new Date(),
        updatedAt : new Date(),
        updatedBy : "SYSTEM",
        createdBy : "SYSTEM",
        icon : "community.png",
        isDeleted : false,
        isVisible : true,
        status : "active"
      },
      {
        name : "Education Leader",
        externalId : "educationLeader",
        createdAt : new Date(),
        updatedAt : new Date(),
        updatedBy : "SYSTEM",
        createdBy : "SYSTEM",
        icon : "el.png",
        isDeleted : false,
        isVisible : true,
        status : "active"
      },
      {
        name : "School Process",
        externalId : "schoolProcess",
        createdAt : new Date(),
        updatedAt : new Date(),
        updatedBy : "SYSTEM",
        createdBy : "SYSTEM",
        icon : "sp.png",
        isDeleted : false,
        isVisible : true,
        status : "active"
      }
    ];

    for( let category = 0 ; category < projectCategories.length; category++ ) {

      let uploadUrl = 
      await kendraServiceHelper.upload(
        `public/assets/projectCategories/${projectCategories[category].icon}`,
        `static/projectCategories/${projectCategories[category].icon}`
      );

      if( !uploadUrl.success ) {
        return ("Could not upload url");
      }

      projectCategories[category].icon = "static/projectCategories/" + projectCategories[category].icon; 
    }

    await db.collection('projectCategories').insertMany(projectCategories);
  },

  async down(db) {
  }
};
