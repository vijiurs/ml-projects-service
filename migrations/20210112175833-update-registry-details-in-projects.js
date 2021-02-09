module.exports = {
  async up(db) {
      
      global.migrationMsg = "Update registry details in projects entity";
      
      let projects = await db.collection('projects').find({
        entityId : { $exists : true },
        isDeleted : false
      }).project({ _id: 1 }).toArray();

      let chunkOfProjects = _.chunk(projects, 100);

      for (let projects = 0; projects < chunkOfProjects.length; projects++) {
  
        let projectId = chunkOfProjects[projects].map(project => {
              return project._id;
        });

        let projectDocuments =
        await db.collection('projects').find({
            _id: { $in: projectId }
        }).project({
            "entityId": 1
        }).toArray();

        let entityId = projectDocuments.map(projectData => {
          return projectData.entityId
        })

        let entityDocuments = await db.collection('entities').find({
          _id: { "$in": entityId },
          registryDetails: { "$exists": true }
        }).project({
          "registryDetails": 1
        }).toArray();

        if (entityDocuments.length > 0) {
          
          let entityRegistryMap = _.keyBy(entityDocuments, '_id');

          for (let project = 0; project < projectDocuments.length; project++) {
              if (entityRegistryMap[projectDocuments[project].entityId.toString()] &&
                  Object.keys(entityRegistryMap[projectDocuments[project].entityId.toString()].registryDetails).length > 0) {
                  await db.collection('projects').findOneAndUpdate
                      (
                          { _id: projectDocuments[project]._id },
                          {
                              $set: {
                                  "entityInformation.registryDetails": entityRegistryMap[projectDocuments[project].entityId.toString()].registryDetails
                              }
                          },
                          {
                              upsert: true
                          }
                      )
              }
          }
      }
      }
  },

  async down(db) {
  }
};
