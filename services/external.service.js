/**
 * @project.service.js
 *
 * api related functionalities are written below
 */

/**
 * Loading Application level configuration data
 */
var config = require('../config/config.json');



var solutionsModel = require('../models/solutions.js');
var projectsModel = require('../models/projects.js');
var taskModel = require('../models/task.js');
var programsModel = require('../models/programs.js');
var impTemplatesModel = require('../models/impTemplates.js');
var fs = require('fs');

var winston = require('../config/winston');

var mongoose = require('../node_modules/mongoose');
var pushNotification = require('../helpers/notifications');



/**
 * Loading external libraries used
 */

var Q = require('q');

var moment = require('moment');
const uuidv1 = require('uuid/v1');
const csv = require('csvtojson');


var _this = this;
var api = {};
api.mapSolutionsToProgram = mapSolutionsToProgram;
api.mapUsersToSolution = mapUsersToSolution;
api.createImpTemplates = createImpTemplates;
api.mapSchoolsToProjects = mapSchoolsToProjects;

module.exports = api;

async function readCSVTemplates(filePath) {

    console.log("in func call");
    let jsonData = await csv().fromFile(filePath);
    return jsonData;
};


async function createImpTemplates(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let jsonArrayOfProjects = await readCSVTemplates("./temp/" + req.files.projectsTemplate[0].filename);
            var jsonArrayOfTasks = await readCSVTemplates("./temp/" + req.files.taskDetails[0].filename);
            var projectsTemp = [];

            let requestType = "create";
            if (req.body.requestType) {
                requestType = req.body.requestType
            }

            let externalIds = [];
            async function validateExternalId() {
                return new Promise(async function (resolve, reject) {
                    await Promise.all(
                        jsonArrayOfProjects.map(async function (field) {

                            if (!field.externalId && requestType != "update") {
                                resolve({ status: "failed", message: "externalId is missing" });
                            } else if (field.externalId) {
                                if (!externalIds.includes(field.externalId)) {
                                    externalIds.push(field.externalId);
                                } else {
                                    resolve({ status: "failed", message: "externalId is duplicate" });
                                }
                                let templateDocs = await impTemplatesModel.findOne({ externalId: field.externalId }, { externalId: 1, _id: 1 });
                                if (templateDocs) {
                                    resolve({ status: "failed", message: "externalId is exist" });
                                }
                            }
                        }));
                    resolve({ status: "success" });
                });
            }

            let res = await validateExternalId();
            if (res.status == "failed") {
                return resolve(res);
            }

            await Promise.all(
                jsonArrayOfProjects.map(async ele => {
                    var raw = jsonArrayOfTasks;
                    if ((ele.ProjectTitle == undefined || ele.ProjectGoal == undefined) && requestType != "update") {
                        return resolve({
                            status: 500,
                            error: "ProjectTitle or ProjectGoal found in  projectsTemplate csv"
                        });
                    }
                    var allowed = [ele.projectId];
                    var tasks = [];
                    var taskList = await jsonArrayOfTasks.filter(obj => {
                        return obj.projectId === ele.projectId
                    })

                    await Promise.all(taskList.map(async (indTask) => {
                        var subTasks = indTask.subTasks.split(';');
                        var subTasksArray = [];
                        await Promise.all(subTasks.map(async (element) => {
                            let subTaskInfo = {
                                title: element
                            }
                            subTasksArray.push(subTaskInfo);
                        }))

                        var taskInfo = {
                            title: indTask.TaskTitle,
                            subTasks: subTasksArray
                        }
                        tasks.push(taskInfo);
                    }));


                    let category = "";
                    if (ele.category) {
                        category = ele.category.split(';');
                    }

                    var concepts = "";
                    if (ele.concepts && ele.concepts.indexOf(';') > -1) {
                        concepts = ele.concepts.split(';');
                    } else {
                        concepts = ele.concepts;
                    }
                    var Keywords = "";
                    if (ele.Keywords && ele.Keywords.indexOf(';') > -1) {
                        Keywords = ele.Keywords.split(';');
                    } else {
                        Keywords = ele.Keywords;
                    }
                    var primaryAudience = "";

                    if (ele.primaryAudience && ele.primaryAudience.indexOf(';') > -1) {
                        primaryAudience = ele.primaryAudience.split(';');
                    } else {
                        primaryAudience = ele.primaryAudience;
                    }

                    let resource_name_field = "Resource-name";
                    let resource_link_field = "Resource-link"

                    let resources = [];

                    let lastResourceCount = 2;
                    for (let i = 1; i < lastResourceCount; i++) {
                        if (ele[resource_name_field + i]) {

                            resources.push({
                                name: ele[resource_name_field + i],
                                link: ele[resource_link_field + i]
                            });
                            lastResourceCount = lastResourceCount + 1
                        }
                    }

                    if (requestType == "update") {

                        let data = await impTemplatesModel.findOne({ _id: ele.templateId });
                        if (data) {
                            if (ele.ProjectTitle) {
                                data["title"] = ele.ProjectTitle;
                            }
                            if (ele.externalId) {
                                data["externalId"] = ele.externalId;
                            }
                            if (ele.Organisation) {
                                data["organisation"] = ele.Organisation;
                            }
                            if (ele.ApproximateDuration) {
                                data["duration"] = ele.ApproximateDuration;
                            }
                            if (ele.DifficultyLevel) {
                                data["difficultyLevel"] = ele.DifficultyLevel;
                            }
                            if (ele.ProjectGoal) {
                                data["goal"] = ele.ProjectGoal;
                            }
                            if (concepts) {
                                data["concepts"] = concepts;
                            }
                            if (Keywords && Keywords.length > 0) {
                                data["keywords"] = Keywords;
                            }
                            if (ele.primaryAudience) {
                                data["primaryAudience"] = primaryAudience;
                            }
                            if (ele.ProjectRationale) {
                                data["rationale"] = ele.ProjectRationale;
                            }
                            if (ele.RecommendedFor) {
                                data["recommendedFor"] = ele.RecommendedFor;
                            }
                            if (ele.AssociatedRisks) {
                                data["risks"] = ele.AssociatedRisks;
                            }
                            if (ele.ProtocolsAndPrinciples) {
                                data["protocols"] = ele.ProtocolsAndPrinciples;
                            }
                            if (tasks && tasks.length > 0) {
                                data["tasks"] = tasks;
                            }
                            if (ele.Vision) {
                                data["vision"] = ele.Vision;
                            }
                            if (ele.Problemdefinition) {
                                data["problemDefinition"] = ele.Problemdefinition;
                            }
                            if (ele.Prerequisites) {
                                data["prerequisites"] = ele.Prerequisites;
                            }
                            if (ele.Assumptions) {
                                data["assumptions"] = ele.Assumptions;
                            }

                            if (resources && resources.length > 0) {
                                data["resources"] = resources;
                            }

                            if (ele.SupportingDocuments) {
                                data["supportingDocuments"] = ele.SupportingDocuments;
                            }
                            if (ele.PossibleApproaches) {
                                data["approaches"] = ele.PossibleApproaches;
                            }
                            if (ele.SuccessIndicators) {
                                data["successIndicators"] = ele.SuccessIndicators;
                            }
                            if (ele.SuggestedNextImprovementProject) {
                                data["suggestedProject"] = ele.SuggestedNextImprovementProject;
                            }
                            if (category) {
                                data["category"] = category;
                            }
                            data['updatedAt'] = moment().format();
                            delete data._id;

                            var updateData = await impTemplatesModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele.templateId) }, data);
                            if (updateData._id) {
                                var projectData = {
                                    impTemplateId: updateData._id,
                                    name: updateData.title,
                                    result: "updated"
                                }
                                projectsTemp.push(projectData);
                            } else {
                                var projectData = {
                                    impTemplateId: ele.impTemplateId,
                                    result: "failed to update"
                                }
                                projectsTemp.push(projectData);
                            }

                        } else {
                            var projectData = {
                                impTemplateId: ele.impTemplateId,
                                result: "impTemplateId not found db"
                            }
                            projectsTemp.push(projectData);
                        }

                    } else {

                        var impTemplatesData = {
                            title: ele.ProjectTitle,
                            externalId: ele.externalId,
                            organisation: ele.Organisation,
                            duration: ele.ApproximateDuration,
                            difficultyLevel: ele.DifficultyLevel,
                            goal: ele.ProjectGoal,
                            concepts: concepts,
                            keywords: Keywords,
                            primaryAudience: primaryAudience,
                            rationale: ele.ProjectRationale,
                            recommendedFor: ele.RecommendedFor,
                            risks: ele.AssociatedRisks,
                            protocols: ele.ProtocolsAndPrinciples,
                            // originalAuthor:OriginalAuthor,
                            createdAt: moment().format(),
                            createdBy: "",
                            tasks: tasks,
                            vision: ele.Vision,
                            problemDefinition: ele.Problemdefinition,
                            prerequisites: ele.Prerequisites,
                            assumptions: ele.Assumptions,
                            resources: resources,
                            supportingDocuments: ele.SupportingDocuments,
                            approaches: ele.PossibleApproaches,
                            successIndicators: ele.SuccessIndicators,
                            suggestedProject: ele.SuggestedNextImprovementProject,
                            category: category

                        }

                        var dat = await impTemplatesModel.create(impTemplatesData);
                        if (dat._id) {
                            var projectData = {
                                impTemplateId: dat._id,
                                name: dat.title,
                            }
                            projectsTemp.push(projectData);
                        } else {
                            throw "Some error while creating impTemplate"
                        }
                    }
                })
            )

            return resolve({
                status: 200,
                template: projectsTemp
                //    response:taskList
            });
        } catch (error) {
            return reject({
                status: 500,
                message: error,
                errorObject: error
            });
        }
        finally {
            // console.log("final bloack executed");
            fs.unlink("./temp/" + req.files.projectsTemplate[0].filename);
            fs.unlink("./temp/" + req.files.taskDetails[0].filename);
        }
    });
}








function mapSolutionsToProgram(body) {
    var deferred = Q.defer();

    var requestBody = body;

    if (requestBody.programId && requestBody.impTemplateId) {

        programsModel.findOne({ '_id': mongoose.Types.ObjectId(requestBody.programId) }, function (er, projectDoc) {

            console.log(er, "projectDoc", projectDoc);
            if (projectDoc) {



                impTemplatesModel.findOne({ '_id': mongoose.Types.ObjectId(requestBody.impTemplateId) }, function (er, templateData) {



                    if (templateData) {


                        // console.log("templateData",templateData);


                        // let apiResp = JSON.parse(body);


                        // console.log("apiResp=======", apiResp);

                        var solutionSchema = new solutionsModel({

                            "resourceType": ["ImprovmentProject Solution"],
                            "language": ["English"],
                            "keywords": ["Framework", "Improvment Project"],
                            "concepts": [""],
                            "createdFor": [],
                            "type": "improvementproject",
                            "subType": "",
                            "registry": [],
                            "deleted": false,
                            "externalId": uuidv1(),
                            "name": templateData.title,
                            "description": "",
                            "author": "",
                            "createdAt": moment().format(),
                            "updatedAt": moment().format(),
                            "frameworkId": "",
                            "entityTypeId": "",
                            "entityType": "",
                            "status": "Open",
                            "isDeleted": false,
                            "isReusable": true,
                            "parentSolutionId": "",
                            "baseProjectDetails": [templateData],
                            "programId": mongoose.Types.ObjectId(requestBody.programId),
                            "roles": {
                                "projectManagers": [],
                                "programManagers": [],
                                "collaborators": []
                            },
                            // "usersId":Array

                        });


                        solutionSchema.save(function (err, doc) {

                            if (doc) {


                                var projectObj = {
                                    components: projectDoc.components
                                }

                                projectObj.components.push(doc._id);
                                // console.log("projectDoc",projectObj);
                                programsModel.findOneAndUpdate({ '_id': mongoose.Types.ObjectId(requestBody.programId) }, projectObj, function (er, projectUp) {

                                    if (err) {
                                        deferred.resolve({ status: "failed", solutionDetails: doc, message: "during updating project", error: er });

                                    } else {

                                        // console.log("ee",soluInfo);
                                        deferred.resolve({ "project": projectUp, status: "success", templateData: templateData, solutionDetails: doc });
                                    }

                                });

                            } else {
                                deferred.resolve({ status: "failed", error: err });
                            }


                        })

                    } else {
                        deferred.resolve({ status: "failed", message: "invalid implTemplateId" });

                    }

                });

                // } else {
                //         deferred.resolve({ status: "failed", error: error });
                //     }



                // console.log("opt", reqOpt);
                // request(reqOpt, apiCallback);
                // } else {
                //     deferred.resolve(result);
                // }



                // });
            } else {
                deferred.resolve({ status: "failed", message: "invalid programId" });

            }

        });


    } else {
        deferred.resolve({ status: "failed", message: "invalid request" });

    }


    return deferred.promise;

}




function mapUsersToSolution(req) {
    var deferred = Q.defer();
    var loop = 0;
    async function readCsv() {
        try {
            console.log("jsonArray");
            const jsonArray = await csv().fromFile("./temp/" + req.file.filename);
            // console.log("jsonArray",jsonArray);
            // fs.unlink("./temp/"+req.file.filename);
            var errJson = [];
            jsonArray.forEach(function (element, i) {
                var userId = element.userId;
                console.log(element.userId, "element", element.solutionId);
                solutionsModel.findOne({ '_id': mongoose.Types.ObjectId(element.solutionId), 'programId': mongoose.Types.ObjectId(element.programId) }, function (err, solDoc) {
                    if (solDoc) {
                        console.log("solDoc found");
                        // var roles = solDoc.roles;
                        // console.log("solDoc",roles);

                        // roles.projectManagers.push(element.userId);
                        // console.log("roles",roles);

                        if (element.roles == "projectManager") {
                            solDoc.roles.projectManagers.push(element.userId);
                        }
                        if (element.roles == "programManager") {
                            solDoc.roles.programManagers.push(element.userId);
                        }
                        if (element.roles == "collaborators") {
                            solDoc.roles.collaborators.push(element.userId);
                        }

                        var programManager = [];
                        if (element.managerId) {
                            solDoc.roles.programManagers.push(element.managerId);
                            programManager.push(element.managerId);
                        }
                        console.log("updated ele", solDoc);
                        solutionsModel.findOneAndUpdate({ '_id': mongoose.Types.ObjectId(element.solutionId), 'programId': mongoose.Types.ObjectId(element.programId) }, solDoc, function (err, doc) {
                            // console.log("doc",doc);
                            if (doc) {
                                console.log("solDoc found");
                                var docInfo = solDoc.baseProjectDetails[0];
                                // console.log("doc", docInfo.difficultyLevel.code);
                                var splidata = docInfo.difficultyLevel;
                                // docInfo.difficultyLevel = splidata;
                                // var difficultyLevel
                                // var deficultyLevel = JSON.parse(difficultyLevel.code);

                                console.log("deficultyLevel", splidata);
                                var projectData = new projectsModel(
                                    {
                                        // "id": "String",
                                        "title": docInfo.title,
                                        "goal": docInfo.goal,
                                        "userId": userId,
                                        "collaborator": "",
                                        "organisation": docInfo.organisation,
                                        "duration": docInfo.duration,
                                        "difficultyLevel": docInfo.difficultyLevel,
                                        "status": "not yet started",
                                        "createdAt": moment().format(),
                                        "programId": solDoc.programId,
                                        "solutionId": solDoc._id,
                                        "programManagers": programManager,
                                        // "lastSync": { type : Date, default: Date.now },
                                        "lastSync": moment().format(),
                                        "primaryAudience": "",
                                        "concepts": docInfo.concepts,
                                        "keywords": docInfo.keywords,
                                        "vision": docInfo.vision,
                                        "problemDefinition": docInfo.problemDefinition,
                                        "prerequisites": docInfo.prerequisites,
                                        "assumptions": docInfo.prerequisites,
                                        "resources": docInfo.resources,
                                        "supportingDocuments": docInfo.supportingDocuments,
                                        "approaches": docInfo.approaches,
                                        "successIndicators": docInfo.successIndicators,
                                        "suggestedProject": docInfo.suggestedProject,
                                        "category": docInfo.category
                                    });
                                var projectIDs = [];
                                projectData.save(function (err, projectDoc) {
                                    if (err) {
                                        console.log("err", err);
                                        deferred.resolve(err);
                                    }
                                    let messageObject = {
                                        type: "projectAdded",
                                        title: "New Project",
                                        action: "added",
                                        internal: false,
                                        text: "A New Project has been assigned to you",
                                        payload: {
                                            projectID: projectDoc._id
                                        },
                                        user_id: userId,
                                        created_at: moment().format()
                                    }
                                    pushNotification.pushToKafka(userId, messageObject);
                                    if (projectDoc) {
                                        projectIDs.push(projectDoc._id);
                                        // console.log("projectDoc",projectDoc);
                                        let taskInput = docInfo;
                                        var subTasksArray = [];
                                        // console.log(" docInfo.sIPRefActivityList",docInfo.sIPRefActivityList);
                                        docInfo.tasks.forEach(el => {
                                            // subTasksArray.push(el)
                                            // element.sub_tasks.forEach(subTasks => {

                                            //     let json = {
                                            //         "title": subTasks.title,
                                            //         "startDate": subTasks.start_date,
                                            //         "endDate": subTasks.end_date,
                                            //         "status": subTasks.status,
                                            //         "lastSync": Date.now(),
                                            //         "assignTo": subTasks.assign_to
                                            //     }
                                            //     // console.log(json)
                                            //     subTasksArray.push(json);
                                            // });
                                            var projectTaskSchema = new taskModel({
                                                "projectId": projectDoc._id,
                                                "title": el.title,
                                                // "startDate": element.start_date,
                                                // "endDate": element.end_date,
                                                "status": "not yet started",
                                                "assignedTo": [],
                                                "lastSync": moment().format(),
                                                "subTasks": el.subTasks,
                                                "programId": solDoc.programId,
                                                "userId": userId,
                                                "createdAt": moment().format()
                                            });
                                            projectTaskSchema.save(function (err, taskDoc) {
                                                if (err) {
                                                    console.log("err", err);
                                                    deferred.resolve(err);
                                                } else {
                                                    console.log("task created", taskDoc._id);
                                                }
                                            });
                                        });
                                    }
                                })
                                loop = loop + 1;
                                var resp = {
                                    status: "success",
                                    solutionId: element.solutionId,
                                    userId: element.userId,
                                    projectIds: projectIDs,
                                    message: "updated to db"
                                }
                                errJson.push(resp);
                                if (loop == jsonArray.length) {
                                    deferred.resolve({ status: "success", response: errJson });
                                }
                            } else {
                                loop = loop + 1;
                                var resp = {
                                    status: "failed",
                                    solutionId: element.solutionId,
                                    userId: element.userId,
                                    message: "error while updating"
                                }
                                errJson.push(resp);
                            }
                            if (loop == jsonArray.length) {
                                deferred.resolve({ status: "success", response: errJson });
                            }
                        });
                    } else {
                        loop = loop + 1;
                        var resp = {
                            status: "failed",
                            solutionId: element.solutionId,
                            userId: element.userId,
                            message: "solutionId not found in db"
                        }
                        errJson.push(resp);
                        if (loop == jsonArray.length) {
                            deferred.resolve({ status: "success", response: errJson });
                        }
                    }
                });

            });
        } catch (err) {
            let obj = {
                status: "failed",
                errorObject: err,
                message: err.message,
                stack: err.stack
            };
            winston.error(obj);


        }
    }
    readCsv();
    return deferred.promise;
}




async function mapSchoolsToProjects(req) {
    return new Promise(async (resolve, reject) => {
        try {

            console.log("tmeplates", req.file.filename);
            let jsonArrayOfProjects = await readCSVTemplates("./temp/" + req.file.filename);
            // var jsonArrayOfTasks = await readCSVTemplates("./temp/" + req.files.taskDetails[0].filename);

            console.log("jsonArrayOfProjects", jsonArrayOfProjects);

            await Promise.all(
                jsonArrayOfProjects.map(async ele => {
                    if (ele.entityType && ele.entityId && ele.projectId) {
                        let updateAarray = {
                            entityType: ele.entityType,
                            entityId: ele.entityId
                        }
                        let updateData = await projectsModel.findOneAndUpdate({ '_id': mongoose.Types.ObjectId(ele.projectId) }, updateAarray);
                        // console.log("update",updateData);

                    }
                })

            );


            return resolve({
                status: "success",
                message: "schools are mapped successfully"
            })

        }
        catch (err) {
            // console.log("-----------",err.message);
            // console.log("-----------",err.stack);
            let er = err;
            let obj = {
                status: "failed",
                errorObject: err,
                message: err.message,
                stack: err.stack
            };
            winston.error(obj);
            return resolve(obj);
        }
        finally {
            fs.unlink("./temp/" + req.file.filename);

        }
    });
}
