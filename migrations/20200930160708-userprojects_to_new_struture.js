var _ = require("lodash");
const { v4: uuidv4 } = require('uuid');
module.exports = {
  async up(db) {
    global.migrationMsg = "Migrating existing projects to new struture";


    var projects = await db.collection('userProjects').find({}).toArray();

    var projectsData = [];
    var usersProjectsArray = _.chunk(projects, 100);

    for (i = 0; i < usersProjectsArray.length; i++) {
      for (j = 0; j < usersProjectsArray[i].length; j++) {
        var projectCreation = await createProject(usersProjectsArray[i][j]);
        projectsData.push(projectCreation);
      }

    };

    if (projectsData) {
      await db.collection('projects').insertMany(projectsData);
    }


    function getStatus(status) {

      if (status == "not started yet" || status == "not yet started" || status == "Not started" || status == "open") {
        return "notStarted";
      } else if (status == "In Progress" || status == "in progress") {
        return "inProgress";
      } else if (status == "Completed" || status == "completed") {
        return "completed";
      }
    }

    function getTaskReport(taskData) {

      // var taskArray = {};
      // taskArray = Object.keys(taskData);
      var started = 0;
      var inprogress = 0;
      var completed = 0;
      if(taskData){
        taskData.map(function (task) {

        // var task = taskData[taskId];
        if (task.status == "notStarted") {
          started = started + 1;
        } else if (task.status == "inProgress") {
          inprogress = inprogress + 1;
        } else if (task.status == "completed") {
          completed = completed + 1;
        }
      });
    }

      return {
        "total": taskData.length ? taskData.length : 0,
        "notStarted": started,
        "inProgress": inprogress,
        "completed": completed
      }
    }

    function createProject(project) {
      return new Promise(async function (resolve, reject) {


        var programInformation = await db.collection('programs').findOne({ _id: project.programId });

        if (programInformation.components) {
          delete programInformation.components;
        }
        var solutionInformation = await db.collection('solutions').findOne({ _id: project.solutionId });

        var tasks = await db.collection('userProjectsTasks').find({ projectId: project._id }).toArray();

        var categories;
        if (project.category) {
          categories = await db.collection('projectCategories').find({ externalId: { $in: project.category } }).project({ externalId: 1, name: 1, _id: 1 }).toArray();
        }

        var entityInfo = {};
        if (project.entityId) {
          entityInfo = await db.collection('entities').findOne({ _id: project.entityId });
        }


        var templateId;
        if (solutionInformation && solutionInformation.baseProjectDetails && solutionInformation.baseProjectDetails[0]) {
          templateId = solutionInformation.baseProjectDetails[0]._id;
        }

        var templateExternalId;
        if (templateId) {
          var templateData = await db.collection('projectTemplates').findOne({ _id: templateId });
          if (templateData) {
            templateExternalId = templateData.externalId;
          }
        }
        // if(solutionInformation.baseProjectDetails && solutionInformation.baseProjectDetails != null){
        //   delete solutionInformation.baseProjectDetails;
        // }
        
        var taksInfo = [];
        tasks.map(function (task) {

          var taskType = "improvementProject";
          var hasSubTasks = false;
          if (task.subTasks && task.subTasks.length > 0) {
            hasSubTasks = true;
          }

          var attachments = [];
          if (task.attachments && task.attachments.length > 0) {
            task.attachments.map(attachment => {
              attachments.push({
                "name": attachment.name,
                "type": attachment.type,
                "isUploaded": true,
                "sourcePath": attachment.sourcePath
              });
            });
          }

          

          let taskResources = [];
          if(task.resources && task.resources.length > 0){
            task.resources.map(resource =>{
              let id = resource.split(resource.link);
              taskResources.push({
                name:resource.name,
                link:resource.link,
                id:id[id.length-1]
              });
            })
          }
          

          var id = uuidv4();
          var taskData = {
            "_id": id,
            "isDeleted": task.isDeleted ? task.isDeleted : false,
            "isDeleteable": task.isDeleted ? task.isDeleted :false,
            "taskSequence": [],
            "visibleIf": [],
            "deleted": false,
            "type": taskType,
            "name": task.title,
            "externalId": task._id,
            "updatedAt": task.lastSync,
            "createdAt": task.createdAt,
            "status": getStatus(task.status),
            "isImportedFromLibrary": project.createdType ? (project.createdType == "by reference") ? true : false : false,
            "attachments": attachments,
            "remarks": task.remarks ? task.remarks : "",
            "assignee": task.assigneeName ? task.assigneeName : "",
            "learningResources": taskResources,
            "hasSubTasks": hasSubTasks,
            "syncedAt": task.lastSync
          }
          taskData['children'] = [];

          if (templateId) {
            taskData['projectTemplateId'] = templateId;
          }

          if (task.subTasks) {
            task.subTasks.map(function (subTask) {

              var subTaskId = uuidv4();
              var subTaskInfo = {
                "_id": subTaskId,
                "startDate": subTask.startDate,
                "endDate": subTask.endDate,
                "isDeleted": subTask.isDeleted,
                "isDeleteable": subTask.isDeleted,
                "taskSequence": [],
                "children": [],
                "visibleIf": [],
                "deleted": subTask.isDeleted,
                "type": "single",
                "name": subTask.title,
                "externalId": subTask._id,
                "updatedAt": subTask.lastSync,
                "createdAt": task.createdAt,
                "status": getStatus(subTask.status),
                "syncedAt": subTask.lastSync
              }
              if (templateId) {
                subTaskInfo['projectTemplateId'] = templateId;
              }
              taskData['children'].push(subTaskInfo);
            });
          }
          taksInfo.push(taskData);
        });

        let projectsResources = [];
        if(project.resources && project.resources.length > 0){
          
          project.resources.map(projectResource =>{
            let id = projectResource.split(projectResource.link);
            projectsResources.push({
              name:projectResource.name,
              link:projectResource.link,
              id:id[id.length-1]
            });
            
          })
        }

        var projectNewObj = {

          "userId": project.userId,
          "createdFor": [process.env.ROOT_ORGANISATION_ID],
          "isDeleted": project.isDeleted,
          "categories": categories,
          "createdBy": project.userId,
          "tasks": taksInfo,
          "updatedBy": project.userId,
          "rootOrganisations": [process.env.ROOT_ORGANISATION_ID],
          "deleted": project.isDeleted ? project.isDeleted : false,
          "title": project.title,
          "description": project.goal,
          "metaInformation": {
            "rationale": "sample",
            "primaryAudience": project.primaryAudience
          },
          "status": getStatus(project.status),
          "updatedAt": project.lastSync,
          "syncedAt": project.lastSync,
          "createdAt": project.createdAt,
          "solutionInformation": solutionInformation,
          "programInformation": programInformation,
          "taskReport": getTaskReport(taksInfo),
          "taskSequence": [],
          "projectTemplateId": templateId,
          "projectTemplateExternalId": templateExternalId,
          "learningResources": projectsResources
        }

        if (entityInfo && entityInfo._id) {
          projectNewObj['entityId'] = entityInfo._id;
          projectNewObj['entityExternalId'] = entityInfo.metaInformation.externalId;
          projectNewObj['entityInformation'] = entityInfo;
        }
        return resolve(projectNewObj);

      });
    }


  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
