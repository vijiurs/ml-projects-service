var _ = require("lodash");
var moment = require('moment');
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
        

        if(solutionInformation && solutionInformation.baseProjectDetails && solutionInformation.baseProjectDetails != null){
          delete solutionInformation.baseProjectDetails;
        }
        
        var taksInfo = [];
        tasks.map(function (task) {

          var taskType = "simple";
          var hasSubTasks = false;
          if (task.subTasks && task.subTasks.length > 0) {
            hasSubTasks = true;
          }

          var attachments = [];
          if (task.attachments && task.attachments.length > 0) {
            task.attachments.map(attachment => {
              if(attachment.sourcePath){
                attachments.push({
                  "name": attachment.name,
                  "type": attachment.type,
                  "isUploaded": true,
                  "sourcePath": attachment.sourcePath
                });
              }
            });
          }

          

          let taskResources = [];
          if(task.resources && task.resources.length > 0){
            task.resources.map(resource =>{
              let taskmapResource = {
                name:resource.name,
                link:resource.link
              }
              let id;
              try {
                 id = resource.split(resource.link);
                 taskmapResource['id']= id[id.length-1];
              } catch (error) {
              }
              taskResources.push(taskmapResource);
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
            "updatedAt": task.updatedAt ?  task.updatedAt :  moment().format(),
            "createdAt": task.createdAt ? task.createdAt : moment().format(),
            "status": getStatus(task.status),
             "attachments": attachments,
            "remarks": task.remarks ? task.remarks : "",
            "assignee": task.assigneeName ? task.assigneeName : "",
            "learningResources": taskResources,
            "hasSubTasks": hasSubTasks,
            "syncedAt": task.lastSync
          }
          taskData['children'] = [];

          
          let importFromLibrary = false;
          if (templateId) {
            taskData['projectTemplateId'] = templateId;
            importFromLibrary = true;
          }
          taskData["isImportedFromLibrary"] = importFromLibrary;

          if (task.subTasks) {
            task.subTasks.map(function (subTask) {

              var subTaskId = uuidv4();
              var subTaskInfo = {
                "_id": subTaskId,
                "startDate": subTask.startDate,
                "endDate": subTask.endDate,
                "isDeleted": subTask.isDeleted ? subTask.isDeleted :false,
                "isDeleteable": subTask.isDeleted ? subTask.isDeleted :false,
                "taskSequence": [],
                "children": [],
                "visibleIf": [],
                "deleted": subTask.isDeleted ? subTask.isDeleted : false,
                "type": "single",
                "name": subTask.title,
                "externalId": subTask._id,
                "updatedAt": subTask.updatedAt ? subTask.updatedAt :  moment().format(),
                "createdAt": task.createdAt,
                "status": getStatus(subTask.status),
                "syncedAt": subTask.lastSync ?  subTask.lastSync :  moment().format()
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

            let resourceMap = {
              name:projectResource.name,
              link:projectResource.link,
            }
            let id;
            try {
              id = projectResource.split(projectResource.link);   
              resourceMap['id'] = id[id.length-1];

            } catch (error) {
            }
            projectsResources.push(resourceMap);
            
          })
        }

        var projectNewObj = {
          "userId": project.userId,
          "createdFor": [process.env.ROOT_ORGANISATION_ID],
          "isDeleted": project.isDeleted ? project.isDeleted : false,
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
          "updatedAt": project.lastSync ? project.lastSync :  moment().format(),
          "syncedAt": project.lastSync ? project.lastSync :  moment().format(),
          "createdAt": project.createdAt ? project.createdAt : moment().format(),
          "solutionInformation": solutionInformation,
          "programInformation": programInformation,
          "taskReport": getTaskReport(taksInfo),
          "taskSequence": [],
          "learningResources": projectsResources,
          "isImportedFromLibrary" : templateId ? true : false
        }

        if(templateId){
          projectNewObj["projectTemplateId"] = templateId;
          projectNewObj["projectTemplateExternalId"] = templateExternalId;
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
