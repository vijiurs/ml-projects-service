module.exports = {
  async up(db) {
    
    global.migrationMsg = "Uploaded Project categories";
    const kendraServiceHelper = require("../generics/services/kendra");

    let projectCategories = [
      {
        name : "TEACHER",
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
        name : "STUDENTS",
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
        name : "INFRASTRUCTURE",
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
        name : "COMMUNITY",
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
        name : "EDUCATION LEADER",
        externalId : "educationLeader",
        createdAt : new Date(),
        updatedAt : new Date(),
        updatedBy : "SYSTEM",
        createdBy : "SYSTEM",
        icon : "educationLeader.png",
        isDeleted : false,
        isVisible : true,
        status : "active"
      },
      {
        name : "SCHOOL PROCESS",
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

      await kendraServiceHelper.upload(
        `public/assets/projectCategories/${projectCategories[category].icon}`,
        `static/projectCategories/${projectCategories[category].icon}`
      );

      projectCategories[category].icon = "static/projectCategories/" + projectCategories[category].icon; 
    }

    await db.collection('projectCategories').insertMany(projectCategories);
  },

  async down(db) {
  }
};
