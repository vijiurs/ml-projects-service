/**
 * @template.service.js
 *
 * templates api related functionalities are written below
 */

/**
 * Loading Application level configuration data
 */
var config = require('../config/config.json');
var templateModel = require('../models/impTemplates.js');
var winston = require('../config/winston');
var mongoose = require('../node_modules/mongoose');
var commonHandler = require('../helpers/common-handler');



/**
 * Loading external libraries used here
 */




var _this = this;
var api = {};
api.getTemplates = getTemplates;
api.getImprovementProjects = getImprovementProjects;
api.getTemplateDetailsById = getTemplateDetailsById;
module.exports = api;


/**
 * @getTemplates the function used to get all the templates
 * @return the templates based on group
 */
function getTemplates(req) {
    return new Promise(async function (resolve, reject) {
        try {
            let templateInfo = await templateModel.find({   creationType :{ $ne : config.createdSelf } });
            let array = [];
            let data = {};
            if (templateInfo.length > 0) {
                await Promise.all(templateInfo.map(async function (item) {
                    await Promise.all(item.category.map(async function (ele) {
                        if (array.includes(ele)) {
                            data[ele].push(item);
                        } else {
                            array.push(ele);
                            data[ele] = [];
                            data[ele].push(item);
                        }
                    }));
                }));
                resolve({ status: "success", "data": data, "message": "all template data featched successfully" });
            } else {
                resolve({ status: "failed", "data": [], "message": "no template found" });
            }
            
        } catch (error) {
            winston.error(error);
            reject({ status: "failed", message: error })
        }
    })
}

/**
 * @name getImprovementProjects the function used to specific the templates
 * @return array of templates
 */
function getImprovementProjects(req) {
    return new Promise(async function (resolve, reject) {
        try {

            let templateInfo = await templateModel.find({ externalId : { $in:req.body.externalIds } },
                { _id:1,title:1,goal:1,externalId:1 }
            );
            if(templateInfo && templateInfo.length > 0){
                resolve({ status: 200, "result": templateInfo, "message": " Improvement project data" });
            }else{
                resolve({ status: 500, "result": templateInfo, "message": " No improvement project found" });
            }


        } catch (error) {
            winston.error(error);
            reject({ status: "failed", message: error })
        }
    })
}

/**
 * @name getTemplateDetailsById the function used to get template details by id
 * @return template details
 */
function getTemplateDetailsById(req) {
    return new Promise(async function (resolve, reject) {
        try {

            let templateInfo = await templateModel.find({ _id:mongoose.Types.ObjectId(req.params.id) });
            if(templateInfo && templateInfo.length > 0){
                resolve({ status: "success", "result": templateInfo, "message": " Improvement project data" });
            }else{
                resolve({ status: "failed", "result": templateInfo, "message": " No improvement project found" });
            }   


        } catch (error) {
            winston.error(error);
            reject({ status: "failed", message: error })
        }
    })
}
