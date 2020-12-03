var fs = require("fs");
let _ = require("lodash");

module.exports = {
  async up(db) {

    global.migrationMsg = "Private program creation for users"

    let usersProjects = await db.collection('userProjects').aggregate([
      {
         $match: { "createdType": { $eq: "by self" } }  
      },
      {
          $group: {
           _id: { userId: { userId:"$userId" } },
              project: { $push:  {   _id: "$_id", solutionId: "$solutionId",programId:"$programId" } }
          }
      }
         
   ]).toArray();

  
   let totalProject = 0

   let  usersProjectsArray = _.chunk(usersProjects,100);

    async function crateProgram(userId){

      let program = {
        "externalId":userId+"1",
        "name": "Improvement Private Program",
        "description": "Improvement Private Program",
        "owner": userId,
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
        components:[],
      }
      
      let programDoc =  await db.collection('programs').insertOne(program);
      return programDoc.insertedId;

    }

    async function update(projects){
        
      let userId = projects['_id']['userId']['userId'];
      let userProgramCreation = await crateProgram(userId);
      

      let solutionIds = [];
      let programId;
      let projectIds = [];
      await Promise.all(projects.project.map( async function(document){
        projectIds.push(document._id);
        solutionIds.push(document.solutionId);
        if(!programId ){
          programId = document.programId;
        }
      }));

      
      try{
      
      let solutionUpdate = await db.collection('solutions').updateMany({ _id: { $in:solutionIds } },{ $set: { programId:userProgramCreation } }) ;
      let tasksUpdate = await db.collection('userProjectsTasks').updateMany({ projectId:{ $in:projectIds } },{ $set: { programId:userProgramCreation } }) ;
      let userProjects = await db.collection('userProjects').updateMany({ createdType: "by self",userId:userId,_id:{ $in:projectIds } },{ $set: { programId:userProgramCreation }});
      let programUpdate = await db.collection('programs').findOneAndUpdate({ _id:userProgramCreation },{ $set: { components:solutionIds } }) ;
    
      let solutionInfo = await db.collection('solutions').find({ programId:programId },{ baseProjectDetails:1 }).toArray();

      let templateIds = [];
      solutionInfo.map(solutionDoc =>{
        if(!templateIds.includes(solutionDoc.baseProjectDetails[0]._id)){
          templateIds.push( solutionDoc.baseProjectDetails[0]._id);
        }
      });
    
      let removeTemplates = await db.collection("impTemplates").deleteMany({ _id:{ $in : templateIds } });
     
      let obj = { projectIds:projectIds,userProgramCreation:userProgramCreation,userId:userId };
      return  obj;

     }catch(ex){
        throw ex;
      }
      

    }

    let usersProgram = {}
     
    for (let user = 0; user < usersProjectsArray.length; user++) {
      let projects = usersProjectsArray[user].map(userProject => {
        return userProject;
      });
       for(let i= 0; i< projects.length; i++ ){ 
         let response = await update(projects[i]);
      };
    }
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
