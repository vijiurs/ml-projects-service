var fs = require("fs");
let _ = require("lodash");

module.exports = {
  async up(db) {

    global.migrationMsg = "Mapping referance project to private program"

    let usersProjects = await db.collection('userProjects').aggregate([
      {
        $match: { "createdType": { $eq: "by reference" } }
      },
      {
        $group: {
          _id: { userId: { userId: "$userId" } },
          project: { $push: { _id: "$_id", solutionId: "$solutionId", programId: "$programId" } }
        }
      }
    ]).toArray();

    // console.log("usersProjects",usersProjects)
    // sss

    let usersProjectsArray = _.chunk(usersProjects, 2);
    async function checkPrivateProgramExist(userId) {

      let programDoc = await db.collection('programs').findOne({ owner: userId }, { _id: 1 });
      if (programDoc) {
        return programDoc._id;
      } else {

        let program = {
          "externalId": userId + "1",
          "name": "Improvement Private Program",
          "description": "Improvement Private Program",
          "owner": userId,
          // "createdBy": "a082787f-8f8f-42f2-a706-35457ca6f1fd",
          // "updatedBy": "a082787f-8f8f-42f2-a706-35457ca6f1fd",
          "deleted": false,
          "isAPrivateProgram": true,
          "status": "active",
          "resourceType": [
            "program"
          ],
          "language": [
            "English"
          ],

          "keywords": [],
          "concepts": [],
          "createdFor": [
            userId
          ],
          "imageCompression": {
          },
          components: [],
          // "startDate" : ISODate("2018-07-12T11:35:50.963+05:30"),
          // "endDate" : ISODate("2020-07-12T11:35:50.963+05:30"),

        }
        let programDoc = await db.collection('programs').insertOne(program);
        return programDoc.insertedId;
      }
    }

    try {

      for (let user = 0; user < usersProjectsArray.length; user++) {

        let projects = usersProjectsArray[user].map(userProject => {
          return userProject;
        });

        for (let i = 0; i < projects.length; i++) {
          let project = projects[i];


          let userId = project['_id']['userId']['userId'];
          let userProgramCreation = await checkPrivateProgramExist(userId);
         
          let solutionIds = [];
          let programId;
         
          projectIds  = [];
          project.project.map(document => {


            if (!solutionIds.includes(document.solutionId)) {
              solutionIds.push(document.solutionId);
            }

            if (!programId) {
              programId = document.programId;
            }

            if(!projectIds.includes(document._id)){
              projectIds.push(document._id);
            }
          });

          if (solutionIds && solutionIds.length > 0) {
            let programUpdate = await db.collection('programs').findOneAndUpdate({ _id: userProgramCreation }, { $push: { components: solutionIds } });
          }
          let userProjects = await db.collection('userProjects').updateMany({ createdType: "by reference", userId: userId }, { $set: { programId: userProgramCreation } });
          let solutionUpdate = await db.collection('solutions').updateMany({ _id: { $in: solutionIds } }, { $set: { programId: userProgramCreation } });
          let tasksUpdate = await db.collection('userProjectsTasks').updateMany({ projectId:{ $in:projectIds } }, { $set: { programId: userProgramCreation } });

        };
      }
    } catch (error) {
      console.log("error", error);
    }
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
