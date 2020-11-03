/**
 * name : reports.js
 * author : Rakesh
 * created-date : 01-Nov-2020
 * Description : Reports related information.
 */

// Dependencies
const csv = require('csvtojson');
const reportsHelper = require(MODULES_BASE_PATH + "/reports/helper");

/**
   * Reports
   * @class
*/

module.exports = class Reports {

    static get name() {
        return "reports";
    }

    /**
    * @api {get} /improvement-project/api/v1/reports/entity/:_id
    * Entity Report.
    * @apiVersion 1.0.0
    * @apiGroup Reports
    * @apiSampleRequest /improvement-project/api/v1/reports/entity/5f731631e8d7cd3b88ac0659
    * @apiParamExample {json} Request:
     {
        
        "reportType":"lastMonth",
        "category":["5f7ae023252cc522665b60d6"],
        "programName":"School Improvement Project"
      }
    * @apiParamExample {json} Response:
    * {
    "message": "Reports generated successfully.",
    "status": 200,
    "result": {
        "categories": {
            "Community": 1,
            "student": 1
        },
        "tasks": {
            "total": 18,
            "notStarted": 10,
            "inProgress": 5,
            "completed": 3,
            "overdue": 1
        },
        "projects": {
            "total": 1,
            "completed": 0,
            "inProgress": 0,
            "notStarted": 0,
            "overdue": 1
        }
     }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Entity Report
      * @method
      * @name reports
      * @param {Object} req - request data.
      * @param {String} req.params._id - Project id.
      * @returns {JSON} enity report details.
     */
    async entity(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const reports = await reportsHelper.entity(
                    req.params._id,
                    req.userDetails.userInformation.userId,
                    req.body.reportType,
                    req.body.programName ? req.body.programName : "",
                    req.body.category ? req.body.category : []
                );

                return resolve(reports);

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
                    errorObject: error
                });
            }
        })
    }

}