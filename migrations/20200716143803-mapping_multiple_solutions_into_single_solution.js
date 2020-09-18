let _ = require("lodash");
module.exports = {
  async up(db) {
    global.migrationMsg = "Mapping multiple solutions into single solution which havng same template refarence and program"

    let solutions = await db.collection('solutions').aggregate([
      { $unwind: "$baseProjectDetails" },
        { $lookup: {from: "userProjects", localField: "_id", foreignField: "solutionId", as: "projects"} },
      {$match: {projects: { $ne: [] },  $and : [ { "projects.createdType": { $ne :"by self" }} ,{"projects.createdType":{ $ne :"by reference" }}] }   },
       {
          $group:{
              _id:{ programId:{ "programId":"$programId" },baseProjectDetails:{ "baseProjectDetails":"$baseProjectDetails._id" } },
              projects:{ $push:{ solutionId:"$_id","programId":"$programId",templateId:"$baseProjectDetails._id",projectId:"$projects._id" } }
          }  
      },
           
     ]).toArray();

   solutionsArray = _.chunk(solutions,100);
     for (let solution = 0; solution < solutionsArray.length; solution++) {
      let solutionInfo = solutionsArray[solution].map(solutionDoc => {
        return solutionDoc;
      });

      for (let i= 0;i< solutionInfo.length; i++ ){
        let document = solutionInfo[i];
        if(document.projects.length > 1){
        
          let toKeepSolutionId  =[];
          toKeepSolutionId.push(document.projects[0].solutionId);
          let existProgramId = document.projects[0].programId;
        
          let unUsedSolutions = [];
          document.projects = document.projects.slice(1,document.projects[0].length);

          let projectIds =[];
          document.projects.map(docs=>{
              unUsedSolutions.push(docs.solutionId);
            projectIds.push(docs.projectId);
          });

          let updateProgram = await db.collection("programs").updateOne({ _id: existProgramId }, { $push:{ component: toKeepSolutionId } });
          let updateUserProjects= await db.collection("userProjects").updateMany({ _id:{ $in: projectIds } }, { $set:{ solutionId: toKeepSolutionId } });
          let removeUnusedSolution = await db.collection("solutions").remove({ _id:{ $in: unUsedSolutions } });
        }
      };

    }
  },

  async down(db) {
  }
};
