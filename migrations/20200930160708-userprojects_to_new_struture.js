let _ = require("lodash");

module.exports = {
  async up(db) {
    global.migrationMsg = "migrate new struture";

    let projects = await db.collection('userProjects').find({}).toArray();

    let projectsData = [];
    let usersProjectsArray = _.chunk(projects, 100);

    for (i = 0; i < usersProjectsArray.length; i++) {
      for (j = 0; j < usersProjectsArray[i].length; j++) {
        let projectCreation = await createProject(usersProjectsArray[i][j]);
        projectsData.push(projectCreation);
      }

    };

    if (projectsData) {
      await db.collection('projects').insertMany(projectsData);
    }


    function createProject(project) {
      return new Promise(async function (resolve, reject) {

        let programInformation = await db.collection('programs').findOne({ _id: project.programId });
        let solutionInformation = await db.collection('solutions').findOne({ _id: project.solutionId });

        let tasks = await db.collection('userProjectsTasks').find({ projectId: project._id }).toArray();

        let categories;
        if (project.category) {
          categories = await db.collection('projectCategories').find({ externalId: { $in: project.category } }).project({ externalId: 1, name: 1, _id: 1 }).toArray();
        }
        let template;
        if (solutionInformation && solutionInformation.baseProjectDetails) {
          template = solutionInformation.baseProjectDetails[0]._id;
        }

        let taksInfo = [];
        tasks.map(function (task) {

          let taskData = {
            "createdBy": project.userId,
            "updatedBy": project.userId,
            "isDeleted": task.isDeleted,
            "isDeleteable": task.isDeleted,
            "taskSequence": [],
            "visibleIf": [],
            "deleted": false,
            "type": "multiple",
            "projectTemplateId": template,
            "name": task.title,
            "externalId": task._id,
            // "description" : task.,
            "updatedAt": task.lastSync,
            "createdAt": task.createdAt,
            "status": task.status
          }
          taskData['children'] = [];

          if (task.subTasks) {
            task.subTasks.map(function (subTask) {

              taskData['children'].push({
                "startDate": subTask.startDate,
                "endDate": subTask.endDate,
                "createdBy": project.userId,
                "updatedBy": project.userId,
                "isDeleted": subTask.isDeleted,
                "isDeleteable": subTask.isDeleted,
                "taskSequence": [],
                "children": [],
                "visibleIf": [],
                "deleted": subTask.isDeleted,
                "type": "single",
                "projectTemplateId": template,
                "name": subTask.title,
                "externalId": subTask._id,
                //   "description" : subTask.,
                "updatedAt": subTask.lastSync,
                "createdAt": task.createdAt,
                "status": subTask.status
              })
            });
          }
          taksInfo.push(taskData)
        });

        let projectNewObj = {

          "userId": project.userId,
          "createdFor": project.createdFor,
          "isDeleted": project.isDeleted,
          "categories": categories,
          "createdBy": project.userId,
          "tasks": taksInfo,
          "updatedBy": project.userId,
          "rootOrganisations": [project.organisation],
          "deleted": project.isDeleted ? project.isDeleted : false,
          "name": project.title,
          "description": project.goal,
          "metaInformation": {
            "rationale": "sample",
            "primaryAudience": project.primaryAudience
          },
          "status": project.status,
          "updatedAt": project.lastSync,
          "createdAt": project.createdAt,

          "solutionInformation": solutionInformation,
          "programInformation": programInformation
        }

        return resolve(projectNewObj);

      });
    }


  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
