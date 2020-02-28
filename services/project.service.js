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
var winston = require('../config/winston');
var userEntities = require('../helpers/user-entities');
var mongoose = require('../node_modules/mongoose');
var asyncforEach = require('async-foreach').forEach;
var commonHandler = require('../helpers/common-handler');



/**
 * Loading external libraries used
 */

var Q = require('q');
var _ = require('underscore');
var async = require('async');

var moment = require('moment');
// var fs = require('fs');
var http = require('http');
var https = require('https');
// var mime = require('mime');
var path = require('path');
var request = require('request');


var _this = this;
var api = {};

api.getAllProjects = getAllProjects;
api.syncProject = syncProject;
api.createTask = createTask;
api.createSubTask = createSubTask;
api.syncSubTask = syncSubTask;
api.deleteTask = deleteTask;
api.deleteSubTask = deleteSubTask;
api.taskSync = taskSync;
api.schoolList = schoolList;
api.projectsByEntity = projectsByEntity;
api.projectsDetailsById = projectsDetailsById;
api.getTaskDetailsById = getTaskDetailsById;
api.getSubTaskDetails = getSubTaskDetails;
api.getProjectPdf = getProjectPdf;
api.syncLocalDataOnUpgradeOfApp = syncLocalDataOnUpgradeOfApp;
api.getProjectPdfWithSyc = getProjectPdfWithSyc;
module.exports = api;

/**
 * 
 * this function is used For to get the Projects of the User
 * it response the project details with programs data of the projects
 * @param {*}   
 */

function getAllProjectsOld(req) {

    var deferred = Q.defer();
    let dataObj = [];
    console.log("user id ", req.body.userId);

    if (req.body.userId) {
        async function getUserProjects(resolve, reject) {
            try {
                let projectsArray = [];
                let programsData = await programsModel.aggregate([
                    // { $match: { 'roles.programManagers': req.body.userId, type: "improvmentproject" } },

                    { "$unwind": "$components" },
                    {
                        $lookup: {
                            from: "solutions",
                            localField: "components",
                            foreignField: "_id",
                            as: "solutions"

                        }
                    },
                    { "$unwind": "$solutions" },
                    { "$match": { "solutions.type": "improvementproject", 'solutions.roles.projectManagers': req.body.userId } }
                ]);
                var programsArray = [];
                var programsArray2 = [];
                var len = 0;
                // console.log("programsData", programsData);
                if (programsData && programsData.length > 0) {
                    programsData.forEach(element => {
                        async.parallel({
                            projects: function (callback) {
                                projectsModel.aggregate([
                                    { $match: { solutionId: element.solutions._id, userId: req.body.userId } },
                                    {
                                        $lookup: {
                                            from: "userProjectsTasks",
                                            localField: "_id",
                                            foreignField: "projectId",
                                            as: "tasks"
                                        }
                                    }], function (err, doc) {
                                        if (doc) {
                                            // console.log("programsArray2",programsArray2);
                                            if (programsArray2.includes(element._id.toString())) {
                                                // console.log(programsArray,"includes",programsArray2)
                                                let lp = 0;
                                                programsArray.forEach(function (value, i) {

                                                    // console.log("value.programsId ===  element._id", value.programs._id, "=== " + element._id)
                                                    if (value.programs._id.toString() === element._id.toString()) {

                                                        // console.log("equal", doc);
                                                        programsArray[i].projects.push(doc[0]);

                                                        // console.log(i);
                                                    }
                                                    lp = lp + 1;
                                                    if (lp == programsArray.length) {
                                                        callback(null, programsArray);
                                                    }
                                                });
                                            } else {
                                                var programData = element;
                                                delete programData.solutions;
                                                var pogramsAndProjects = {
                                                    programs: element,
                                                    projects: []
                                                };
                                                pogramsAndProjects.projects = doc;

                                                var js = { programsId: element._id, data: pogramsAndProjects };
                                                var js = pogramsAndProjects;
                                                programsArray.push(js);
                                                programsArray2.push(element._id.toString());
                                                callback(null, programsArray);
                                            }
                                        }
                                    });
                            }
                        }, function (err, results) {
                            len = len + 1;
                            if (len == programsData.length) {
                                deferred.resolve({ status: "success", message: "user data", data: programsArray });
                            }
                        });
                    });
                } else {
                    deferred.resolve({ status: "failed", message: "user data not found" });
                }
            } catch (err) {
                console.log("err", err);
            }
        }
        getUserProjects();
    } else {
        deferred.resolve({ status: "failed", message: "user data not found" });
    }
    return deferred.promise;
}

function getAllProjects(req) {
    var deferred = Q.defer();
    let dataObj = [];
    // console.log("req", req.body.userId);
    if (req.body.userId) {
        let query = {};
        // if (req.query && req.query.type && req.query.type == "quarter") {
        //     var dateFrom = moment().subtract(3, 'months').format('YYYY-MM-DD');
        //     let dt = new Date(dateFrom);
        //     query = { 'projects.userId': req.body.userId, 'projects.createdAt': { $gte: dt }, 'isDeleted': false }
        // } else if (req.query && req.query.type && req.query.type == "month") {
        //     var dateFrom = moment().subtract(1, 'months').format('YYYY-MM-DD');
        //     let dt = new Date(dateFrom);
        //     query = { 'projects.userId': req.body.userId, 'projects.createdAt': { $gte: dt }, 'isDeleted': false }
        // } else {

        //     query = { 'projects.userId': req.body.userId, 'isDeleted': false }
        // }

        query = { 'projects.userId': req.body.userId }


        console.log("query", query);
        async function getUserProjects(resolve, reject) {
            try {
                let programsData = await programsModel.aggregate([
                    // { $match: { 'roles.programManagers': req.body.userId, type: "improvmentproject" } },

                    // { "$unwind": "$components" },
                    {
                        $lookup: {
                            from: "userProjects",
                            localField: "_id",
                            foreignField: "programId",
                            as: "projects"

                        }
                    },

                    { "$unwind": "$projects" },
                    { "$match": query },

                    {
                        $group: {
                            _id: "$_id",
                            resourceType: { $first: "$resourceType" },
                            language: { $first: "$language" },
                            keywords: { $first: "$keywords" },
                            concepts: { $first: "$concepts" },
                            createdFor: { $first: "$createdFor" },
                            imageCompression: { $first: "$imageCompression" },
                            // components: { $first: "$components" },
                            externalId: { $first: "$externalId" },
                            name: { $first: "$name" },
                            description: { $first: "$description" },
                            owner: { $first: "$owner" },
                            createdBy: { $first: "$createdBy" },
                            updatedBy: { $first: "$updatedBy" },
                            isDeleted: { $first: "$isDeleted" },
                            status: { $first: "$status" },
                            startDate: { $first: "$startDate" },
                            endDate: { $first: "$endDate" },
                            createdAt: { $first: "$createdAt" },
                            projects: { $push: "$projects" }
                            // total: { $sum: "$projects" }
                        }
                    }

                ]);
                if (programsData && programsData.length > 0) {
                    // console.log("programsData.length === ",programsData.length);
                    var Allprojects = [];
                    let i = 0;
                    await Promise.all(
                        programsData.map(async projectList => {
                            // asyncforEach(programsData, function (projectList, i) {
                            let projectsOfProgram = [];
                            var prLn = projectList.projects.length;
                            // var pr = projectList;
                            var lp = 0;
                            console.log("projectList.projects", projectList.projects.length);
                            await Promise.all(
                                projectList.projects.map(async function (element) {
                                    // projectList.projects.forEach(function (element, index) {
                                    await getProjectAndTaskDetails(element._id).then(function (resp) {
                                        // console.log("resp======", resp);
                                        lp = lp + 1;


                                        resp.isNew = false;
                                        resp.isSync = true;
                                        resp.isEdited = false;
                                        resp.share = false;

                                        console.log(resp.title, "resp.createdType", resp.createdType);
                                        resp.createdType = resp.createdType ? resp.createdType : "";
                                        resp.isDeleted = resp.isDeleted ? resp.isDeleted : false;
                                        resp.isStarted = resp.isStarted ? resp.isStarted : false;

                                        projectsOfProgram.push(resp);

                                        if (prLn == lp) {

                                            var prList = projectList;
                                            delete projectList.projects;

                                            var dt = {
                                                "programs": prList,
                                                "projects": projectsOfProgram
                                            }
                                            Allprojects.push(dt);
                                            if (Allprojects.length == programsData.length) {
                                                deferred.resolve({ status: "success", message: "user data", data: Allprojects });
                                            }
                                        }
                                    });
                                    i = i + 1;
                                }));
                        }));
                } else {
                    deferred.resolve({ status: "failed", message: "No Data Available", });
                }
            } catch (err) {
                console.log("err", err);
                winston.error(err);
            }
        }
        getUserProjects();
    } else {
        deferred.resolve({ status: "200", message: "user data not found" });
    }

    return deferred.promise;
}

/**
 * is used get the project data and tasks details of specific projectId
 * @param {*} projectId 
 * 
 */
async function getProjectAndTaskDetails(projectId) {
    return new Promise(async (resolve, reject) => {
        try {
            let projectData = await projectsModel.findOne({ '_id': projectId }).lean();
            // console.log("porgram",projectId);
            if (projectData) {
                let tasks = [];
                tasks = await taskModel.find({ 'projectId': projectId, isDeleted: { $ne: true } }).sort({ _id: 1 }).lean();
                // console.log("tasks",tasks);
                var response = {
                };
                // console.log("tasks",tasks);
                // projectData.tasks  = "";
                let tasksData = [];

                await Promise.all(tasks.map(async function (taskList) {

                    taskList['isNew'] = false;
                    tasksData.push(taskList);
                }));

                projectData.tasks = tasksData;
                response = projectData;
                return resolve(response);
            } else {
                var response = {
                };
                response = projectData;
                return resolve(response);
            }
        } catch (error) {
            console.log("error while getting projects and Tasks", error);
            return reject(error);
        }
    });

}

async function syncProject(req) {
    return new Promise(async function (resolve, reject) {
        try {
            // console.log("sync api - userId : " + req.body.userId, req.body);
            let shareDocs;
            let failedToSync = [];
            if (req.body && req.body.projects) {
                await Promise.all(req.body.projects.map(async function (projectDocument) {
                    var syncData = {
                        // "id": "String",
                        "title": projectDocument.title,
                        "goal": projectDocument.goal,
                        // "userId": "",
                        "collaborator": projectDocument.collaborator,
                        "organisation": projectDocument.organisation,
                        "duration": projectDocument.duration,
                        "isDeleted": projectDocument.isDeleted ? projectDocument.isDeleted : false,
                        "difficultyLevel": projectDocument.difficultyLevel,
                        "status": projectDocument.status,
                        // "lastSync": { type : Date, default: Date.now },
                        "lastSync": moment().format(),
                        "primaryAudience": projectDocument.primaryAudience,
                        "concepts": projectDocument.concepts,
                        "keywords": projectDocument.keywords,
                        "startDate": projectDocument.startDate ? projectDocument.startDate : "",
                        'endDate': projectDocument.endDate ? projectDocument.endDate : "",
                        'createdType': projectDocument.createdType ? projectDocument.createdType : "",
                        'isStarted': projectDocument.isStarted ? projectDocument.isStarted : false
                    };

                    // console.log("projectDocument.createdType",projectDocument.createdType);


                    // Get hardcoded value from .env file.

                     if (projectDocument && projectDocument._id && projectDocument.isEdited == true &&
                        projectDocument.isNew == false) {


                        
                            if(projectDocument.createdType && projectDocument.createdType =="" ){
                                commonHandler.updateCreateTypeByProgramId(projectDocument,req.body.userId);
                            }


                        if (projectDocument.share == true) {
                            shareDocs = projectDocument._id;
                        }

                        let doc = await projectsModel.findOne({ '_id': projectDocument._id }, { '_id': 1 });
                        if (doc) {
                            projectsModel.findOneAndUpdate({ '_id': projectDocument._id },
                                syncData, { new: true }, (function (err, projectDoc) {
                                    if (err) {
                                        // winston.error("failed while updating to project")/
                                        winston.error("error at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectDocument));
                                    }
                                }));
                            var taskUpdateData = projectDocument.tasks;
                            await Promise.all(taskUpdateData.map(async function (element) {
                                if (element.isNew == true) {
                                    var taskData = new taskModel({
                                        "title": element.title,
                                        "startDate": element.startDate,
                                        "endDate": element.endDate,
                                        "status": element.status,
                                        "assignedTo": element.assignedTo,
                                        "lastSync": moment().format(),
                                        "subTasks": element.subTasks,
                                        "projectId": projectDocument._id,
                                        "userId": projectDocument.userId,
                                        "isDeleted": false,
                                        "imageUrl": element.imageUrl ? element.imageUrl : "",
                                        "file": element.file ? element.file : {},
                                        "remarks": element.remarks ? element.remarks : ""
                                    });
                                    taskData.save(taskData, function (err, taskDt) {
                                        commonHandler.projectCompletedNotificationPoint(projectDocument._id);

                                        if (taskData) {
                                        } else {
                                            winston.error("error at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectDocument));
                                            winston.error(err);
                                        }
                                    });
                                } else if (element._id) {
                                    let taskData = {};
                                    Object.keys(element).forEach(eachElement => {
                                        if (["startDate", "endDate", "isDeleted", "_id", "projectId", "programId", "createdAt", "projectStarted"].indexOf(eachElement) == -1) {
                                            taskData[eachElement] = element[eachElement];
                                        }
                                    });
                                    if (!element.isDeleted) {
                                        // taskData['isDeleted'] =false;
                                    } else {
                                        taskData['isDeleted'] = element.isDeleted;
                                    }
                                    let taskDataUpdate = await taskModel.findOneAndUpdate({ '_id': element._id }, taskData, { new: true });
                                }
                            }));
                        } else {
                            winston.error("error project not found at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectDocument));
                            let failed = {
                                message: "project not found",
                                status: "failed",
                                projectDocument: projectDocument
                            }
                            failedToSync.push(failed);
                        }
                    } else if (projectDocument && projectDocument.createdType && projectDocument.createdType == config.createdFromReferance && projectDocument.isNew == true) {
                        async function updateProjectWithReferanceTemplate() {
                            req.createdBy = req.body.userId;
                            req.templateId = projectDocument.templateId;

                            // req.createdType = projectDocument.createdType ?  projectDocument.createdType : "";
                            // req.isStarted = projectDocument.isStarted ?  projectDocument.isStarted : "";



                            if (projectDocument.templateId) {
                                let projectMap =
                                    await commonHandler.updateProjectFromTemplateReferance(projectDocument, req.body.userId);
                                // console.log("projectMap", projectMap);
                                if (projectMap.status && projectMap.status == "failed") {
                                    winston.error("error at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectMap));


                                    let failed = {
                                        message: projectMap.message ? projectMap.message : "",
                                        projectDocument: projectDocument
                                    }
                                    failedToSync.push(failed);
                                } else {
                                    if (projectMap.response && projectMap.response.projectData && projectMap.response.projectData._id && projectDocument.share) {
                                        shareDocs = projectMap.response.projectData._id;
                                        console.log("shareDocs", shareDocs);
                                    }
                                }
                            } else {
                                winston.error("templateId not found at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectMap));

                                let failed = {
                                    message: "templateId not found",
                                    projectDocument: projectDocument
                                }
                                failedToSync.push(failed);
                            }
                        }
                        await updateProjectWithReferanceTemplate()
                    }
                    else if (projectDocument && projectDocument.createdType && projectDocument.createdType == config.createdSelf && projectDocument.isNew == true) {
                        // create template for project if only createdType is by self
                        req.createdBy = req.body.userId;

                        req.createdType = projectDocument.createdType ? projectDocument.createdType : "";
                        req.isStarted = projectDocument.isStarted ? projectDocument.isStarted : "";

                        let response = await commonHandler.createTemplateAndPrject(projectDocument, req.body.userId);
                        if (response.status && response.status != "success") {
                            winston.error("templateId not found at Sync  userId:" + req.body.userId + " project" + JSON.stringify(response));

                            let failed = {
                                message: response.message ? response.message : "",
                                status: "failed",
                                projectDocument: projectDocument
                            }
                            failedToSync.push(failed);
                        } else {
                            console.log("response.response.projectData", response.response.projectData);
                            if (response.response && response.response.projectData && response.response.projectData._id && projectDocument.share) {
                                shareDocs = response.response.projectData._id;
                                console.log("shareDocs", shareDocs);
                            }

                        }

                    } else if(projectDocument && projectDocument._id && projectDocument.isEdited == false &&
                        projectDocument.isNew == false){

                            if(projectDocument.createdType && projectDocument.createdType =="" ){
                                commonHandler.updateCreateTypeByProgramId(projectDocument,req.body.userId);
                            }
                            
                            console.log("No nned to  Updated the project isEdited :false",projectDocument._id);

                    }else{

                        winston.error("error at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectDocument));
                        failedToSync.push(projectDocument);
                    }
                }));
                let requestedData = {
                    body: {
                        userId: req.body.userId
                    }

                }

                // if (req.query && req.query.type) {
                //     let query = {
                //         type: req.query.type ? req.query.type : "month"
                //     }
                //     requestedData['query'] = query;
                // }

                let allProjectData = await getAllProjects(requestedData);

                if (allProjectData && shareDocs) {
                    if (allProjectData.data && allProjectData.data.length > 0) {
                        await Promise.all(allProjectData.data.map(async function (projectGroup, index) {
                            if (projectGroup.projects) {
                                await Promise.all(projectGroup.projects.map(async function (eachProjects, projectIndex) {
                                    if (eachProjects) {
                                        // console.log(eachProjects._id,"shareDocs",shareDocs)
                                        if (shareDocs) {
                                            if (shareDocs.toString() === ((eachProjects._id).toString())) {
                                                // eachProjects['share']=
                                                console.log("matching");
                                                //  console.log("allProjectData.data[index]",allProjectData.data[index]);
                                                allProjectData.data[index].projects[projectIndex]['share'] = true;

                                                // console.log(" allProjectData.data[index].projects[projectIndex]", allProjectData.data[index].projects[projectIndex]);
                                            }
                                        }

                                    }

                                }));
                            }
                        }));
                    }
                }


                // console.log("allProjectData",allProjectData);
                if (failedToSync.length > 0) {
                    return resolve({ status: "failed", message: "failed to sync" })
                } else {
                    return resolve({ status: "success", allProjects: allProjectData })
                }

            } else {

                let data = await syncOldAPPData(req);
                resolve(data);
            }
        } catch (error) {
            reject({ status: "failed", message: error });
        }
    });
}

async function syncOldAPPData(req) {

    console.log("sync old api - userId : " + req.body.userId, req.body);
    var deferred = Q.defer();
    var syncData = {
        // "id": "String",
        "title": req.body.title,
        "goal": req.body.goal,
        // "userId": "",
        "collaborator": req.body.collaborator,
        "organisation": req.body.organisation,
        "duration": req.body.duration,
        "isDeleted": req.body.isDeleted ? req.body.isDeleted : false,
        "difficultyLevel": req.body.difficultyLevel,
        "status": req.body.status,
        // "lastSync": { type : Date, default: Date.now },
        "lastSync": moment().format(),
        "primaryAudience": req.body.primaryAudience,
        "concepts": req.body.concepts,
        "keywords": req.body.keywords,
        "startDate": req.body.startDate ? req.body.startDate : "",
        'endDate': req.body.endDate ? req.body.endDate : ""
    };

    //map the project to template only if createdType is by referance

    let requestedData = {
        body: {
            userId: req.body.userId
        },
        query: {
            type: req.query.type ? req.query.type : "month"
        }
    }
    // Get hardcoded value from .env file.

    if (req.body && req.body.createdType && req.body.createdType == "by reference") {

        async function updateProjectWithReferanceTemplate() {
            req.createdBy = req.body.userId;
            req.templateId = req.body.templateId;

            if (req.body.templateId) {
                let projectMap = await commonHandler.updateProjectFromTemplateReferance(req.body, req.body.userId);
                if (projectMap.status && projectMap.status == "success") {
                    let obj = {
                        body: {
                            projectId: projectMap.response.projectIds[0]
                        }
                    }
                    let prjectDetails = await projectsDetailsById(obj);
                    if (prjectDetails.status && prjectDetails.status == "success") {

                        let allProjectData = await getAllProjects(requestedData);

                        delete projectMap.response;
                        projectMap.projectDetails = prjectDetails;
                        projectMap.allProjects = allProjectData;
                        deferred.resolve(projectMap);
                    } else {
                        deferred.resolve(prjectDetails);
                    }
                } else {
                    deferred.resolve(projectMap);
                }

            } else {
                deferred.resolve({ status: "failed", message: "templateId not found" });
            }
        }
        await updateProjectWithReferanceTemplate()

    }
    else if (req.body && req.body.createdType && req.body.createdType == "by self") {
        // create template for project if only createdType is by self


        async function createTemplate() {

            req.createdBy = req.body.userId;

            console.log("req.body.createdType", req.body.createdType);
            let response = await commonHandler.createTemplateAndPrject(req.body, req.body.userId);

            console.log("response.status", response.status);
            if (response.status) {
                let obj = {
                    body: {
                        projectId: response.response.projectIds[0]
                    }
                }
                let prjectDetails = await projectsDetailsById(obj);

                console.log("prjectDetails.status", prjectDetails);
                if (prjectDetails.status && prjectDetails.status == "success") {
                    let allProjectData = await getAllProjects(requestedData);
                    response.projectDetails = prjectDetails;
                    response.allProjects = allProjectData;
                    deferred.resolve(response);
                } else {
                    deferred.resolve(prjectDetails);
                }
            } else {
                deferred.resolve(response);
            }
        }

        await createTemplate();

    } else {
        let allProjectData = await getAllProjects(requestedData);
        projectsModel.findOne({ '_id': req.body._id }, function (err, doc) {

            // console.log("doc", doc);

            if (doc) {
                projectsModel.findOneAndUpdate({ '_id': req.body._id }, syncData, { new: true }, (function (err, projectDoc) {
                    if (err) {
                        deferred.resolve(err);
                    }

                    // if (projectDoc) {
                    // deferred.resolve({ status: "200", message: "project data" });
                    // }
                }));
                var taskUpdateData = req.body.tasks;
                var loop = 0;
                // console.log(" taskUpdateData",JSON.stringify( taskUpdateData))
                taskUpdateData.forEach(element => {
                    if (element.isNew == true) {

                        if (element.startDate && typeof element.startDate === 'string') {
                            element.startDate = moment(element.startDate, 'DD-MM-YYYY')
                            element.startDate = element.startDate.format();
                            // element.startDate = moment(element.startDate).format();
                        }
                        if (element.endDate && typeof element.endDate === 'string') {
                            element.endDate = moment(element.endDate, 'DD-MM-YYYY')
                            element.endDate = element.endDate.format();
                            // element.endDate = moment(element.endDate).format();
                        }


                        var taskData = new taskModel({
                            "title": element.title,
                            "startDate": element.startDate,
                            "endDate": element.endDate,
                            "status": element.status,
                            "assignedTo": element.assignedTo,
                            "lastSync": moment().format(),
                            "subTasks": element.subTasks,
                            "projectId": req.body._id,
                            "userId": req.body.userId,
                            "isDeleted": false,
                            "imageUrl": element.imageUrl ? element.imageUrl : "",
                            "file": element.file ? element.file : {},
                            "remarks": element.remarks ? element.remarks : ""
                        });
                        taskData.save(taskData, function (err, taskDt) {
                            loop = loop + 1;
                            if (loop == taskUpdateData.length) {
                                getProjectAndTaskDetails(req.body._id).then(function (response) {
                                    commonHandler.projectCompletedNotificationPoint(req.body._id);
                                    deferred.resolve({ status: "succes", message: "sync successfully done", data: response });
                                });
                            }
                            if (taskData) {
                            } else {
                                winston.error(err);
                            }
                        });
                    } else if (element._id) {

                        let taskData = {};
                        Object.keys(element).forEach(eachElement => {
                            if (["startDate", "endDate", "isDeleted", "_id", "projectId", "programId", "createdAt", "projectStarted"].indexOf(eachElement) == -1) {
                                taskData[eachElement] = element[eachElement];
                            }
                        });
                        if (!element.isDeleted) {
                            // taskData['isDeleted'] =false;
                        } else {
                            taskData['isDeleted'] = element.isDeleted;
                        }


                        taskModel.findOneAndUpdate({ '_id': element._id }, taskData, { new: true }, (function (err, taskUpdateDataInfo) {
                            if (err) {
                                console.log("err--", err);
                                deferred.resolve(err);
                            }
                            loop = loop + 1;
                            if (loop == taskUpdateData.length) {
                                getProjectAndTaskDetails(req.body._id).then(function (response) {
                                    commonHandler.projectCompletedNotificationPoint(req.body._id);
                                    deferred.resolve({ status: "succes", message: "sync successfully done", data: response, allProjects: allProjectData });
                                });
                            }
                        }));
                    }
                });
            } else {
                deferred.resolve({ status: "failed", message: "project not found" });
            }
        });
    }
    return deferred.promise;

}

function createTask(req) {

    var deferred = Q.defer();
    let taskInput = req.body;
    if (req.body.projectId) {

        console.log("req.body.projectId", req.body.projectId);

        projectsModel.findOne({ '_id': req.body.projectId }, (function (err, projectInfo) {

            // console.log("projectInfo", projectInfo);
            if (projectInfo) {

                var subTasksArray = [];
                // taskInput.forEach(element => {

                async.parallel({
                    subtaskLoop: function (callback) {

                        let lp = 0;
                        taskInput.subTasks.forEach(subTasks => {

                            let json = {
                                "title": subTasks.title,
                                "startDate": subTasks.startDate,
                                "endDate": subTasks.endDate,
                                "status": subTasks.status,
                                "lastSync": Date.now(),
                                "isDeleted": false,
                                "assignedTo": subTasks.assignedTo
                            }
                            // console.log(json)

                            lp = lp + 1;
                            subTasksArray.push(json);

                            if (lp == taskInput.subTasks.length) {
                                callback(null, subTasksArray);
                            }
                        });

                    }
                }, function (err, results) {

                    var projectTaskSchema = new taskModel({
                        "projectId": req.body.projectId,
                        "title": taskInput.title,
                        "startDate": taskInput.startDate,
                        "endDate": taskInput.endDate,
                        "status": taskInput.status,
                        "assignedTo": taskInput.assignedTo,
                        "lastSync": Date.now(),
                        "isDeleted": false,
                        "subTasks": subTasksArray,
                        "userId": req.body.userId

                    });
                    projectTaskSchema.save(function (err, taskDoc) {
                        if (err) {
                            console.log("err", err);
                            deferred.resolve(err);
                        }
                        deferred.resolve({ status: "success", message: "task created successfully" });
                    });
                });
            } else {
                deferred.resolve({ status: "failed", message: "No project found " });
            }
        }));
    } else {
        deferred.resolve({ status: "failed", message: "Project id not found in request" });
    }
    return deferred.promise;
}

function createSubTask(req) {
    var deferred = Q.defer();
    let taskInput = req.body;
    if (req.body.taskId) {
        console.log("req.body.taskId", req.body.taskId);
        try {
            taskModel.findOne({ '_id': req.body.taskId }, (function (err, taskInfo) {

                // console.log("projectInfo",taskId);
                if (taskInfo) {
                    // var subTasksArray = [];
                    // taskInput.forEach(element => {

                    let newTaskData = {
                        "title": req.body.title,
                        "startDate": req.body.startDate,
                        "endDate": req.body.endDate,
                        "status": req.body.status,
                        "isDeleted": false,
                        "lastSync": Date.now(),
                        "assignedTo": req.body.assignedTo
                    }
                    // console.log(json)

                    // var subTask = [];
                    // subTask = taskInfo.subTasks;

                    taskInfo.subTasks.push(newTaskData);

                    taskModel.findOneAndUpdate({ '_id': req.body.taskId }, taskInfo, function (err, subTaskInfo) {
                        if (err) {
                            console.log("err", err);
                            deferred.resolve(err);
                        }
                        // console.log("subTaskInfo",subTaskInfo);
                        deferred.resolve({ status: "success", message: "sub task created successfully", data: subTaskInfo.subTasks });
                    });

                } else {
                    deferred.resolve({ status: "failed", message: "No task found " });
                }

            }));
        } catch (ex) {
            deferred.resolve({ status: "failed", message: ex });
        }
    } else {
        deferred.resolve({ status: "failed", message: "Task id not found in request" });
    }
    return deferred.promise;
}

/**
 * 
 * @param {*} req 
 * 
 * to sync subtask of the project
 * accepts  taskId, startDate and endDate etc..
 */
function syncSubTask(req) {
    // console.log("req.body.taskId", req.body.taskId);
    var deferred = Q.defer();
    let taskInput = req.body;
    if (req.body.taskId) {
        console.log("req.body.taskId", req.body.taskId);
        var subTasksArray = [];
        taskModel.findOne({ '_id': req.body.taskId }, (function (err, taskInfoData) {
            req.body.subTasks.forEach(function (indSubtasks, index) {
                let taskData = taskInfoData;
                if (indSubtasks.isNew == true) {
                    var subTaskDetails = {
                        title: indSubtasks.title,
                        startDate: indSubtasks.startDate,
                        endDate: indSubtasks.endDate,
                        status: indSubtasks.status,
                        isDeleted: false,
                        lastSync: Date.now(),
                        assignedTo: indSubtasks.assignedTo
                    }
                    if (taskData.subTasks) {
                        taskData.subTasks.push(subTaskDetails);
                    } else {
                        taskData['subTasks'] = [];
                        taskData.subTasks.push(subTaskDetails);
                    }

                    taskModel.findOneAndUpdate({ '_id': req.body.taskId }, taskData, function (err, subTaskInfo) {
                        // console.log("subTaskInfo",subTaskInfo);
                        subTasksArray.push(indSubtasks);
                        if (subTasksArray.length == req.body.subTasks.length) {
                            taskModel.findOne({ '_id': req.body.taskId }, function (err, subTaskInfo) {
                                deferred.resolve({ status: "success", message: "Successful sync", data: subTaskInfo.subTasks });
                            });
                        }

                    });
                } else {
                    taskData.subTasks[index].title = indSubtasks.title;
                    taskData.subTasks[index].startDate = indSubtasks.startDate;
                    taskData.subTasks[index].endDate = indSubtasks.endDate;
                    taskData.subTasks[index].status = indSubtasks.status;
                    taskData.subTasks[index].isDeleted = indSubtasks.isDeleted;
                    taskData.subTasks[index].lastSync = Date.now();
                    taskData.subTasks[index].assignedTo = indSubtasks.assignedTo;

                    taskModel.findOneAndUpdate({ '_id': req.body.taskId }, taskData, function (err, subTaskInfo) {
                        if (err) {
                            // console.log("err", err);
                            deferred.resolve(err);
                        }
                        // taskModel.findOne({ '_id': req.body.taskId }, function (err, subTaskInfo) {
                        //     deferred.resolve({ status: "success", message: "Successful sync", data: subTaskInfo.subTasks });
                        // });

                        subTasksArray.push(indSubtasks);
                        if (subTasksArray.length == req.body.subTasks.length) {
                            taskModel.findOne({ '_id': req.body.taskId }, function (err, subTaskInfo) {
                                deferred.resolve({ status: "success", message: "Successful sync", data: subTaskInfo.subTasks });
                            });
                        }
                    });
                }
            });
        }));
    } else {
        deferred.resolve({ status: "failed", message: "Task id not found in request" });
    }
    return deferred.promise;
}

function deleteTask(req) {
    return new Promise(async (resolve, reject) => {
        try {
            taskModel.findOne({ '_id': req.body.taskId, }, (function (err, taskInfo) {
                if (taskInfo) {

                    taskInfo.isDeleted = true;


                    // console.log("taskInfo",taskInfo);
                    taskModel.findOneAndUpdate({ '_id': req.body.taskId }, taskInfo, function (err, taskInfo) {

                        return resolve({ status: "success", message: "task has beed deleted successfully", data: taskInfo });
                        // deferred.resolve({ status: "success", message: "task has beed deleted successfully", data: taskInfo });
                    });
                } else {
                    return resolve({ status: "failed", message: "No task found for taskId" })
                    // deferred.resolve({ status: "failed", message: "No task found for taskId" });
                }
            })
            );
        } catch (error) {
            return reject(error);
        }
    })

    // var deferred = Q.defer();

    // let taskInput = req.body;
    // if (req.body.taskId) {

    //     taskModel.findOne({ '_id': req.body.taskId, }, (function (err, taskInfo) {
    //         if (taskInfo) {

    //             taskInfo.isDeleted = true;


    //             // console.log("taskInfo",taskInfo);
    //             taskModel.findOneAndUpdate({ '_id': req.body.taskId }, taskInfo, function (err, taskInfo) {

    //                 deferred.resolve({ status: "success", message: "task has beed deleted successfully", data: taskInfo });
    //             });
    //         } else {
    //             deferred.resolve({ status: "failed", message: "No task found for taskId" });
    //         }
    //     })
    //     );
    // } else {
    //     deferred.resolve({ status: "failed", message: "Task id not found in request" });
    // }
    // return deferred.promise;
}


function deleteSubTask(req) {
    var deferred = Q.defer();
    let taskInput = req.body;
    if (req.body.taskId) {
        // console.log("req.body.taskId",req.body.taskId);
        taskModel.findOne({ '_id': req.body.taskId, 'subTasks._id': req.body.subTaskId }, (function (err, taskInfo) {
            if (taskInfo) {

                var subTasksArray = [];
                // taskInput.forEach(element => {
                let found = 0;
                taskInfo.subTasks.forEach(function (element, index) {

                    if (element._id == req.body.subTaskId) {

                        found = 1

                        taskInfo.subTasks[index].isDeleted = true;
                        taskInfo.subTasks[index].lastSync = Date.now();

                        taskModel.findOneAndUpdate({ '_id': req.body.taskId }, taskInfo, function (err, subTaskInfo) {
                            if (err) {
                                // console.log("err", err);
                                deferred.resolve(err);
                            }

                            element.isDeleted = true;
                            taskModel.findOne({ '_id': req.body.taskId }, function (err, subTaskInfo) {
                                deferred.resolve({ status: "success", message: "Successful subtask deleted", data: element });
                            });
                        });
                    }
                    if (index == taskInfo.subTasks.length - 1) {
                        if (found == 0) {
                            deferred.resolve({ status: "failed", message: "sub task not found" });
                        }
                    }
                });
            } else {
                deferred.resolve({ status: "failed", message: "No task found " });
            }
        }));
    } else {
        deferred.resolve({ status: "failed", message: "Task id not found in request" });
    }
    return deferred.promise;
}

function taskSync(req) {
    var deferred = Q.defer();
    let taskInput = req.body;
    console.log("taskInput", taskInput._id);
    projectsModel.findOne({ '_id': req.body._id }, function (err, doc) {
        // console.log("doc", doc);
        if (doc) {
            var taskUpdateData = req.body.tasks;
            var loop = 0;
            taskUpdateData.forEach(element => {

                if (element.isNew == true) {
                    // to create a new task 
                    // createTask();
                    var taskData = new taskModel({
                        "title": element.title,
                        "startDate": element.startDate,
                        "endDate": element.endDate,
                        "status": element.status,
                        "assignedTo": element.assignedTo,
                        "lastSync": moment().format(),
                        "subTasks": element.subTasks,
                        "projectId": req.body._id,
                        "userId": req.body.userId,
                        "isDeleted": false
                    });
                    taskData.save(taskData, function (err, taskDt) {
                        loop = loop + 1;
                        if (loop == taskUpdateData.length) {
                            getProjectAndTaskDetails(req.body._id).then(function (response) {

                                commonHandler.projectCompletedNotificationPoint(req.body._id);
                                deferred.resolve({ status: "succes", message: "sync successfully done", data: response });
                            });
                        }
                        if (taskData) {
                        } else {
                            winston.error(err);
                        }
                    });
                } else if (element._id) {
                    var taskData = {
                        "title": element.title,
                        "startDate": element.startDate,
                        "endDate": element.endDate,
                        "status": element.status,
                        "assignedTo": element.assignedTo,
                        "lastSync": moment().format(),
                        "isDeleted": element.isDeleted,
                        "subTasks": element.subTasks
                    };
                    taskModel.findOneAndUpdate({ '_id': element._id }, taskData, (function (err, taskUpdateDataInfo) {
                        if (err) {
                            console.log("err--", err);
                            deferred.resolve(err);
                        }
                        loop = loop + 1;
                        // console.log("taskUpdateDataInfo", taskUpdateDataInfo);
                        if (taskUpdateDataInfo) {
                        }
                        if (loop == taskUpdateData.length) {

                            getProjectAndTaskDetails(req.body._id).then(function (response) {
                                commonHandler.projectCompletedNotificationPoint(req.body._id);

                                deferred.resolve({ status: "succes", message: "sync successfully done", data: response });
                            });
                        }
                    }));
                }
            });
        } else {
            deferred.resolve({ status: "failed", message: "project not found" });
        }
    });

    return deferred.promise;
}

async function schoolList(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await userEntities.userEntities(req);
            // console.log("data =====",data);
            let schoolList = [];
            // {
            //     "name": "govt high school sagar",
            //     "entityId": "5cfe1f9af5fcff1170088cf8",
            //     "isProjects": true,
            //     "isObservations": true
            // },
            // {
            //     "name": "govt high school tumkur",
            //     "entityId": "5cfe1f9af5fcff1170088cf7",
            //     "isProjects": true,
            //     "isObservations": true
            // }

            // console.log("data.data",data.data);
            if (data.error) {
                return resolve({
                    status: "failed",
                    // message: data.error,
                    data: JSON.parse(data.data)
                });
            } else if (data.status == "failed") {
                return resolve({
                    status: "failed",
                    data: data.data
                });
            } else {
                try {

                    console.log("data.data", data);
                    var dt = JSON.parse(data.data);


                    await Promise.all(dt.result.map(function (ele) {
                        var obj = {};
                        obj.name = ele.metaInformation.name;
                        obj.entityId = ele._id;
                        obj.isProjects = true;
                        obj.isObservations = true;

                        schoolList.push(obj)
                    }));

                    return resolve({
                        status: "succes",
                        message: "school list fetched successfully",
                        data: schoolList
                    });
                } catch (err) {
                    console.log("err", err);

                    return resolve({
                        status: "failed",
                        message: "While parsing the data",
                        // data: JSON.parse(data.result)
                    });
                }
            }
        } catch (error) {
            return reject({
                status: "failed",
                message: error,
                errorObject: error
            });
        }
        finally {
        }
    });
}

async function projectsByEntity(req) {
    return new Promise(async (resolve, reject) => {
        try {
            if (req.body.entityId) {
                let programData = await programsModel.aggregate([
                    {
                        $lookup: {
                            from: "userProjects",
                            localField: "_id",
                            foreignField: "programId",
                            as: "projects"
                        }
                    },
                    { "$unwind": "$projects" },
                    { "$match": { 'projects.entityId': mongoose.Types.ObjectId(req.body.entityId) } },
                    {
                        $group: {
                            _id: "$_id",
                            name: { $first: "$name" },
                            description: { $first: "$description" },
                            projects: { $push: "$projects" }
                        }
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "name": 1,
                            "description": 1,
                            "projects": {
                                "title": 1,
                                "_id": 1
                            }
                        }
                    },
                ]);
                if (programData.length > 0) {
                    return resolve({
                        status: "success",
                        message: "project data",
                        data: programData
                    });
                } else {
                    return resolve({
                        status: "failed",
                        message: "No project data found",
                        data: programData
                    });
                }
            } else {
                return resolve({
                    status: "failed",
                    message: "entityId not found in request",
                    data: []
                });
            }
        } catch (error) {
            winston.error(error);
            return reject({
                status: "failed",
                message: error,
                errorObject: error
            });
        }
        finally {

        }

    });
}
async function projectsDetailsById(req) {
    return new Promise(async (resolve, reject) => {
        try {
            if (req.body.projectId) {

                let projectData = await getProjectAndTaskDetails(req.body.projectId);

                if (projectData) {

                    let programData = await getProgramDataById(projectData.programId);

                    return resolve({
                        status: "success",
                        message: "Project Details",
                        data: {
                            "programs": [programData],
                            "projects": [projectData]
                        }
                    });
                } else {
                    return resolve({
                        status: "failed",
                        message: "No Project Details Found",
                        data: []
                    });
                }
            } else {
                return resolve({
                    status: "failed",
                    message: "projectId not found in request",
                    data: []
                });
            }
        } catch (error) {
            winston.error(error);
            return reject({
                status: "failed",
                message: error,
                errorObject: error
            });
        }
        finally {
        }

    });
}

async function getProgramDataById(programId) {
    return new Promise(async function (resolve, reject) {
        try {
            let programData = await programsModel.findOne({ '_id': programId }).lean();

            if (programData.components) {
                delete programData.components;
            }
            resolve(programData);

        } catch (err) {


            let obj = {
                status: "failed",
                errorObject: err,
                message: err.message,
                stack: err.stack
            };
            winston.error(obj);


            // winston.log()
            console.log("error while fetching program data by id", error);
            reject(obj);
        }
    });
}

function getTaskDetailsById(req) {
    return new Promise(async function (resolve, reject) {
        try {
            let taskInfo = await taskModel.findById({ '_id': req.params.id })
            if (taskInfo) {
                resolve({ status: "success", data: taskInfo });
            } else {
                resolve({ status: "failed", "message": "task not found", data: [] });
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getSubTaskDetails(req) {
    return new Promise(async function (resolve, reject) {
        try {
            let taskInfo = await taskModel.findById({ '_id': req.params.taskId })
            var found = false;
            if (taskInfo) {
                if (taskInfo.subTasks) {
                    await Promise.all(taskInfo.subTasks.map(ele => {
                        if (ele._id == req.params.subTaskId) {
                            found = true;
                            resolve({ status: "success", data: ele, "message": "SubTask Details fetched successfully" });
                        }
                    }));
                    if (!found) {
                        resolve({ status: "failed", "message": "sub task not found", data: [] });
                    }
                } else {
                    resolve({ status: "failed", "message": "sub task not found", data: [] });
                }
            } else {
                resolve({ status: "failed", "message": "sub task not found", data: [] });
            }
        } catch (error) {
            reject(error);
        }
    })
}

function getProjectPdf(req) {
    return new Promise(async function (resolve, reject) {
        try {
            // console.log("req.body.projectId",req.body.projectId)
            let projectData = await getProjectAndTaskDetails(req.body.projectId);
            if (projectData) {

                if (projectData.tasks) {
                    let tasks = [];
                    // to remove files from object
                    await Promise.all(
                        projectData.tasks.map(async list => {
                            let taskList = {};
                            taskList = list;
                            if (taskList.file) {
                                delete taskList.file;
                            }
                            if (taskList.imageUrl) {
                                delete taskList.imageUrl;
                            }
                            tasks.push(taskList);
                        })
                    )
                    projectData.tasks = tasks;
                }

                try {
                    let url = config.dhiti_config.api_base_url + config.dhiti_config.getProjectPdf;
                    request({
                        url: url,
                        method: "POST",
                        headers: {
                            'x-auth-token': req.headers['x-auth-token'],
                            'Content-Type': 'application/json'
                        },
                        json: true,   // <--Very important!!!
                        body: projectData
                    }, function (error, response, body) {
                        // console.log(response);
                        if (error) {
                            winston.error("Error at getProjectPdf ()" + error);
                            reject(body);

                        } else {
                            resolve(body);
                        }

                    });

                    // request.post({
                    //     headers: {
                    //         'x-auth-token': req.headers['x-auth-token'],
                    //         'Content-Type':'application/json'
                    //     }, url: url, projectData
                    // }, async function (error, httpResponse, body) {
                    //     if (error) {
                    //         console.log("error", error);
                    //         winston.error("Error at getProjectPdf ()" + error);
                    //         reject(body);

                    //     } else {
                    //         resolve(body);
                    //     }
                    // });

                }
                catch (ex) {
                    console.log("ex", ex);
                }
            } else {
                resolve({ status: "failed", "message": "project not found" });
            }

        } catch (error) {
            winston.error(error);
            reject(error);
        }
    });
}








/**
 * syncLocalDataOnUpgradeOfApp API to clear the old mongodb projects and 
 * storesa all the incoming data to db
 * @param {*} req 
 */
function syncLocalDataOnUpgradeOfApp(req) {

    return new Promise(async function (resolve, reject) {
        try {

            let requestedData = {
                body: {
                    userId: req.body.userId
                }

            }

            let emailString = "Sync Email";

            let createdProjects = 0;
            let updatedProjects = 0;
            let failed = 0;
            let total = 0;


            let allProjectData = await getAllProjects(requestedData);
            commonHandler.storeRequestBody(req, allProjectData);
            // resolve({ status:"succes" });

            let shareDocs;
            // console.log("sync api - userId : " + req.body.userId, req.body);
            let failedToSync = [];

            if (req.body && req.body.projects && req.body.userId) {


                total = req.body.projects.length;

                console.log("sync old projetcs", req.body.projects.length);

                await Promise.all(req.body.projects.map(async function (projectDocument) {

                    console.log("projectDocument", projectDocument);

                    var syncData = {
                        // "id": "String",
                        "title": projectDocument.title,
                        "goal": projectDocument.goal,
                        // "userId": "",
                        "collaborator": projectDocument.collaborator,
                        "organisation": projectDocument.organisation,
                        "duration": projectDocument.duration,
                        "isDeleted": projectDocument.isDeleted ? projectDocument.isDeleted : false,
                        "difficultyLevel": projectDocument.difficultyLevel,
                        "status": projectDocument.status,
                        // "lastSync": { type : Date, default: Date.now },
                        "lastSync": moment().format(),
                        "primaryAudience": projectDocument.primaryAudience,
                        "concepts": projectDocument.concepts,
                        "keywords": projectDocument.keywords,
                        "startDate": projectDocument.startDate ? projectDocument.startDate : "",
                        'endDate': projectDocument.endDate ? projectDocument.endDate : "",
                        'createdType': projectDocument.createdType ? projectDocument.createdType : "",
                        'isStarted': projectDocument.isStarted ? projectDocument.isStarted : false
                    };

                    // console.log("projectDocument.createdType",projectDocument.createdType);


                    // Get hardcoded value from .env file.


                    if (projectDocument && projectDocument.createdType && projectDocument.createdType == config.createdFromReferance && projectDocument.isNew && projectDocument.isNew === true) {


                        async function updateProjectWithReferanceTemplate() {
                            req.createdBy = req.body.userId;
                            req.templateId = projectDocument.templateId;

                            // req.createdType = projectDocument.createdType ?  projectDocument.createdType : "";
                            // req.isStarted = projectDocument.isStarted ?  projectDocument.isStarted : "";



                            if (projectDocument.templateId) {
                                let projectMap =
                                    await commonHandler.updateProjectFromTemplateReferance(projectDocument, req.body.userId);
                                // console.log("projectMap", projectMap);
                                if (projectMap.status && projectMap.status == "failed") {
                                    winston.error("error at Sync  while creating By referance project userId:" + req.body.userId + " project" + JSON.stringify(projectMap));

                                    failed = failed + 1;

                                    let failed = {
                                        message: projectMap.message ? projectMap.message : "",
                                        projectDocument: projectDocument
                                    }
                                    failedToSync.push(failed);
                                } else {
                                    createdProjects = createdProjects + 1;
                                    if (projectMap.response && projectMap.response.projectData && projectMap.response.projectData._id && projectDocument.share) {
                                        shareDocs = projectMap.response.projectData._id;
                                        console.log("shareDocs", shareDocs);
                                    }
                                }
                            } else {

                                failed = failed + 1;

                                winston.error("templateId not found at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectMap));

                                let failed = {
                                    message: "templateId not found",
                                    projectDocument: projectDocument
                                }
                                failedToSync.push(failed);
                            }
                        }


                        await updateProjectWithReferanceTemplate()


                    }
                    else if (projectDocument && projectDocument.createdType && projectDocument.createdType == config.createdSelf && projectDocument.isNew && projectDocument.isNew == true) {
                        // create template for project if only createdType is by self
                        req.createdBy = req.body.userId;

                        req.createdType = projectDocument.createdType ? projectDocument.createdType : "";
                        req.isStarted = projectDocument.isStarted ? projectDocument.isStarted : "";

                        let response = await commonHandler.createTemplateAndPrject(projectDocument, req.body.userId);
                        if (response.status && response.status != "success") {
                            winston.error("templateId not found at Sync  userId:" + req.body.userId + " project" + JSON.stringify(response));

                            failed = failed + 1;

                            let failed = {
                                message: response.message ? response.message : "",
                                status: "failed",
                                projectDocument: projectDocument
                            }
                            failedToSync.push(failed);
                        } else {
                            createdProjects = createdProjects + 1;
                            console.log("response.response.projectData", response.response.projectData);
                            if (response.response && response.response.projectData && response.response.projectData._id && projectDocument.share) {
                                shareDocs = response.response.projectData._id;
                                console.log("shareDocs", shareDocs);
                            }

                        }

                    } else if (projectDocument && projectDocument._id) {

                        if (projectDocument.share && projectDocument.share == true) {
                            shareDocs = projectDocument._id;
                        }

                        let doc = await projectsModel.findOne({ '_id': projectDocument._id }, { '_id': 1 });
                        if (doc) {
                            projectsModel.findOneAndUpdate({ '_id': projectDocument._id },
                                syncData, { new: true }, (function (err, projectDoc) {
                                    if (err) {
                                        failed = failed + 1;
                                        // winston.error("failed while updating to project")/
                                        winston.error("error at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectDocument));
                                    }
                                }));

                            updatedProjects = updatedProjects + 1;

                            var taskUpdateData = projectDocument.tasks;
                            await Promise.all(taskUpdateData.map(async function (element) {
                                if (element.isNew == true) {
                                    var taskData = new taskModel({
                                        "title": element.title,
                                        "startDate": element.startDate,
                                        "endDate": element.endDate,
                                        "status": element.status,
                                        "assignedTo": element.assignedTo,
                                        "lastSync": moment().format(),
                                        "subTasks": element.subTasks,
                                        "projectId": projectDocument._id,
                                        "userId": projectDocument.userId,
                                        "isDeleted": false,
                                        "imageUrl": element.imageUrl ? element.imageUrl : "",
                                        "file": element.file ? element.file : {},
                                        "remarks": element.remarks ? element.remarks : ""
                                    });
                                    taskData.save(taskData, function (err, taskDt) {

                                        if (taskDt) {
                                            console.log("task created", taskDt);
                                        } else {
                                            console.log("failed to save tasks", err);
                                        }
                                        commonHandler.projectCompletedNotificationPoint(projectDocument._id);

                                        if (taskData) {
                                        } else {

                                            winston.error("error at Sync when saving tasks  userId:" + req.body.userId + " project" + JSON.stringify(projectDocument));
                                            winston.error(err);
                                        }
                                    });
                                } else if (element._id) {
                                    let taskData = {};
                                    Object.keys(element).forEach(eachElement => {
                                        if (["startDate", "endDate", "isDeleted", "_id", "projectId", "programId", "createdAt", "projectStarted"].indexOf(eachElement) == -1) {
                                            taskData[eachElement] = element[eachElement];
                                        }
                                    });
                                    if (!element.isDeleted) {
                                        // taskData['isDeleted'] =false;
                                    } else {
                                        taskData['isDeleted'] = element.isDeleted;
                                    }
                                    let taskDataUpdate = await taskModel.findOneAndUpdate({ '_id': element._id }, taskData, { new: true });
                                }
                            }));
                        } else {

                            failed = failed + 1;

                            winston.error("error projectId not found in DB at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectDocument));
                            let failed = {
                                message: "project not found",
                                status: "failed",
                                projectDocument: projectDocument
                            }
                            failedToSync.push(failed);
                        }
                    } else {
                        failed = failed + 1;
                        winston.error("Not Passed Any Condition error at Sync  userId:" + req.body.userId + " project" + JSON.stringify(projectDocument));
                        failedToSync.push(projectDocument);
                    }

                }));
                let requestedData = {
                    body: {
                        userId: req.body.userId
                    }

                }

                if (req.query && req.query.type) {
                    let query = {
                        type: req.query.type ? req.query.type : "month"
                    }
                    requestedData['query'] = query;
                }

                let allProjectData = await getAllProjects(requestedData);
                if (allProjectData && shareDocs) {
                    if (allProjectData.data && allProjectData.data.length > 0) {
                        await Promise.all(allProjectData.data.map(async function (projectGroup, index) {
                            if (projectGroup.projects) {
                                await Promise.all(projectGroup.projects.map(async function (eachProjects, projectIndex) {
                                    if (eachProjects) {
                                        // console.log(eachProjects._id,"shareDocs",shareDocs)
                                        if (shareDocs) {
                                            if (shareDocs.toString() === ((eachProjects._id).toString())) {
                                                // eachProjects['share']=
                                                console.log("matching");
                                                //  console.log("allProjectData.data[index]",allProjectData.data[index]);
                                                allProjectData.data[index].projects[projectIndex]['share'] = true;

                                                // console.log(" allProjectData.data[index].projects[projectIndex]", allProjectData.data[index].projects[projectIndex]);
                                            }
                                        }

                                    }

                                }));
                            }
                        }));
                    }
                }




                emailString = "<p>Projects Sync Report<p><p>Total : " + total + "</p>" +
                    "<p>createdProjects : " + createdProjects + " </p>" +
                    "<p>Update : " + updatedProjects + " </p>" +
                    "<p>Errors : " + failed + " </p>";

                let body = {
                    "subject": "Old Sync API Report",
                    "text": "",
                    "html": emailString
                }

                console.log("emailString", emailString);

                commonHandler.sendEmail();


                // console.log("allProjectData",allProjectData);
                if (failedToSync.length > 0) {
                    return resolve({ status: "failed", message: "failed to sync" })
                } else {
                    return resolve({ status: "success", allProjects: allProjectData })
                }

            }
        } catch (error) {
            reject({ status: "failed", message: error });
        }
    });
}

/**
 * 
 * @param {*} req 
 *  getProjectPdfWithSyc  api to get the pdf and sync the data
 */
function getProjectPdfWithSyc(req) {
    return new Promise(async function (resolve, reject) {
        try {


            console.log("req.body.pdfData",req.body.pdfData);
            console.log("req.body.projects",req.body.projects);


            if (req.body.pdfData && req.body.projects) {
                try {
                    let syncAPI = new Promise(async function (resolve, reject) {
                        let syncData = await syncProject(req);
                        resolve(syncData);
                    });
                    let callGetProjectApi = new Promise(async function (resolve, reject) {
                        let projectData = req.body.pdfData;
                        console.log("project Data for pdfRepoert", projectData);
                        if (projectData.tasks) {
                            let tasks = [];
                            // to remove files from object
                            await Promise.all(
                                projectData.tasks.map(async list => {
                                    let taskList = {};
                                    taskList = list;
                                    if (taskList.file) {
                                        delete taskList.file;
                                    }
                                    if (taskList.imageUrl) {
                                        delete taskList.imageUrl;
                                    }
                                    tasks.push(taskList);
                                })
                            )
                            projectData.tasks = tasks;
                        }

                        let url = config.dhiti_config.api_base_url + config.dhiti_config.getProjectPdf;
                        request({
                            url: url,
                            method: "POST",
                            headers: {
                                'x-auth-token': req.headers['x-auth-token'],
                                'Content-Type': 'application/json'
                            },
                            json: true,   // <--Very important!!!
                            body: projectData
                        }, function (error, response, body) {
                            // console.log(response);
                            if (error) {
                                winston.error("Error at getProjectPdf ()" + error);
                                reject({ status: "failed", mesage: body });
                            } else {
                                console.log("body", body);
                                resolve(body);

                            }
                        });
                    });
                    Promise.all([syncAPI, callGetProjectApi]).then(function (values) {
                        // console.log("completing promise",values[0]);
                        if (values[0] && values[0].status && values[0].status == "success") {
                            resolve({ allProjects: values[0].allProjects, pdfResponse: values[1] });
                        } else {
                            resolve({ status: "failed", "message": "sync failed" });
                        }
                    });
                }
                catch (ex) {
                    console.log("ex", ex);
                    reject({ status: "failed", mesage: ex });
                }
            } else {
                resolve({ status: "failed", message: "pdfData or projetcs data not found" });
            }
        } catch (ex) {
            console.log("ex", ex);
            winston.error("error in getProjectPdfWithSyc", ex);
            reject({ status: "failed", mesage: ex });
        }
    });
}
