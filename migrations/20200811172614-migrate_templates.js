
const { v4: uuidv4 } = require('uuid');
var moment = require('moment');
var mongoose = require('mongoose');
var totalTasks = 0;
module.exports = {
  async up(db) {
    global.migrationMsg = "Improvement Project Migration"

    let impTemplates = await db.collection('impTemplates').find({}).toArray();

    let templates = [];
    if (impTemplates) {
      for (i = 0; i < impTemplates.length; i++) {

        let templateCreation = await createNewTemplate(impTemplates[i]);
        let templateDoc = await db.collection('projectTemplates').insertOne(templateCreation);
        let solutions = await db.collection('solutions').find({ "baseProjectDetails": { $elemMatch: { "_id": mongoose.Types.ObjectId(impTemplates[i]._id) } } }).toArray();
        let baseProjectDetails = [];
        templateDoc.ops[0] = templateDoc.ops[0];
        templateDoc.ops[0]['_id'] = templateDoc.insertedId;


        await db.collection('projectTemplateTasks').updateMany({ _id: { $in: templateCreation.taskSequence } }, { $set: { "projectTemplateId": templateDoc.insertedId } });
        baseProjectDetails[0] = templateDoc.ops[0];


        await Promise.all(solutions.map(async function (solution) {
          await db.collection('solutions').updateOne({ _id: solution._id }, {
            $set:
            {
              "type": "improvementProject",
              "subType": "improvementProject",
              "baseProjectDetails": baseProjectDetails,
              "isReusable": false
            }
          });
        }));


      };
    }


    async function createNewTemplate(doc) {
      try {
        let categories = doc.category;

        let taskIds = [];
        if (doc.tasks && doc.tasks.length > 0) {
          taskIds = await projectTemplateTasks(doc.tasks);
        }

        let categoryDocs;
        if (categories && categories.length > 0) {
          categoryDocs = await db.collection('projectCategories').find({ "externalId": { $in: categories } }, { externalId: 1 }).toArray();
        }

        let projectCategories = [];
        if (categoryDocs && categoryDocs.length > 0) {
          categoryDocs.map(category => {
            projectCategories.push({ _id: category._id, externalId: category.externalId, name: category.name })
          });
        }

        let templateResources = [];
        if (doc.resources && doc.resources.length > 0) {
          doc.resources.map(resource => {
          try {
            if (resource.link && resource.name ){
                let id = resource.split(resource.link);
                templateResources.push({
                  name: resource.name,
                  link: resource.link,
                  id: id[id.length - 1]
                });
            }
        } catch (error) {
        }
      })
    }

    let template = {
      title: doc.title,
      externalId: uuidv4(),
      categories: projectCategories, // old - category category of the project ex: teacher, school etc..
      duration: {
        value: "1W",
        label: "1 Week"
      }, // duration of the project like 3 months or 1year etc..
      difficultyLevel: {
        value: "B",
        label: "Basic"
      }, // difficulty level of project ex: BASIC,COMPLEX
      description: doc.goal, // old - goal Goal of the project
      concepts: doc.concepts,
      keywords: doc.keywords,
      status: "published", // draft, published
      isDeleted: false, // true, false 
      recommendedFor: [],
      tasks: taskIds,
      createdAt: moment().format(),
      updatedAt: moment().format(), // new field
      createdBy: "SYSTEM",
      updatedBy: "SYSTEM", // new field
      learningResources: templateResources,
      isReusable: true,
      entityType: [], // multiple,
      taskSequence: taskIds,
      metaInformation: {
      }
    }

    if (doc.vision) {
      template['metaInformation']['vision'] = doc.vision;
    }
    if (doc.suggestedProject) {
      template['metaInformation']['suggestedProject'] = doc.suggestedProject;
    }
    if (doc.successIndicators) {
      template['metaInformation']['successIndicators'] = doc.successIndicators;
    }
    if (doc.supportingDocuments && doc.supportingDocuments.length > 0) {
      template['metaInformation']['supportingDocuments'] = doc.supportingDocuments;
    }
    if (doc.problemDefinition) {
      template['metaInformation']['problemDefinition'] = doc.problemDefinition;
    }

    if (doc.assumptions) {
      template['metaInformation']['assumptions'] = doc.assumptions;
    }

    if (doc.prerequisites) {
      template['metaInformation']['prerequisites'] = doc.prerequisites;
    }
    if (doc.risks) {
      template['metaInformation']['risks'] = doc.risks;
    }
    if (doc.rationale) {
      template['metaInformation']['rationale'] = doc.rationale;
    }
    if (doc.primaryAudience && doc.primaryAudience.length > 0) {
      template['metaInformation']['primaryAudience'] = doc.primaryAudience;
    }
    if (doc.approaches) {
      template['metaInformation']['approaches'] = doc.approaches;
    }
    if (doc.protocols) {
      template['protocols'] = doc.protocols;
    }

    return template;

  } catch(error) {
    throw new Error(error);
  }


}


async function projectTemplateTasks(tasks) {
  return new Promise(async function (resolve, reject) {

    let taskIds = [];
    await Promise.all(tasks.map(async function (task) {

      let children = [];
      if (task.subTasks && task.subTasks.length > 0) {
        await Promise.all(task.subTasks.map(async function (subtask) {

          let childrenId = await taskSchema(subtask, []);
          children.push(childrenId);

        }));
      }

      let tasksId = await taskSchema(task, children);

      if (children && children.length > 0) {
        let projectTasks = await db.collection('projectTemplateTasks').updateMany({ _id: { $in: children } }, { $set: { parentId: tasksId } });
      }
      taskIds.push(tasksId);
    }))
    resolve(taskIds);
  })

}
let taskIds = [];

async function taskSchema(task, children) {

  let taskResources = [];
  if (task.resources && task.resources.length > 0) {
    task.resources.map(resource => {
      try {
        if (resource.link && resource.name ){
          let id = resource.split(resource.link);
          taskResources.push({
            name: resource.name,
            link: resource.link,
            id: id[id.length - 1]
          });
        }
      } catch (error) {

      }

    })
  }

  let projectTask = {
    "name": task.title, //  Old - title , title of the task
    "createdAt": task.createdAt ? task.createdAt : moment().format(),
    "updatedAt": moment().format(),
    "createdBy": "SYSTEM",
    "updatedBy": "SYSTEM", // new field
    "isDeleted": task.isDeleted ? task.isDeleted : false,
    "isDeletable": task.isDeleted ? task.isDeleted : false,
    "children": [],
    "visibleIf": [],
    "taskSequence": [],
    "learningResources": taskResources,
    "deleted": task.deleted ? task.deleted : false,
    "type": "simple",
    "externalId": uuidv4(),
    "description": ""
  }
  if (children && children.length > 0) {
    projectTask["children"] = children;
    projectTask["hasSubTasks"] = true;
  } else {
    projectTask["hasSubTasks"] = false;
  }

  let projectTemplateTasks = await db.collection('projectTemplateTasks').insertOne(projectTask);
  return projectTemplateTasks.insertedId;
}

  },

async down(db) {
}
};
