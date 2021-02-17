/**
 * name : reports.js
 * author : Deepa
 * created-date : 13-Feb-2021
 * Description : Reports related information.
 */

// Dependencies
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
    * @api {get} /improvement-project/api/v2/reports/entity/:_id?requestPdf=:requestPdf&programId=:programId&reportType=:reportType
    * Entity Report.
    * @apiVersion 1.0.0
    * @apiGroup Reports
    * @apiSampleRequest /improvement-project/api/v2/reports/entity/5f731631e8d7cd3b88ac0659?requestPdf=false&reportType=1
    * @apiParamExample {json} Response:
    * {
        "message": "Reports generated successfully.",
        "status": 200,
        "result": {
            "data_available": true,
            "data": {
                "categories": {
                    "total": 2,
                    "Community": 2,
                    "student": 1
                },
                "tasks": {
                    "total": 18,
                    "completed": 3,
                    "notStarted": 10,
                    "overdue": 1,
                    "onGoing": 5
                },
                "projects": {
                    "total": 1,
                    "completed": 0,
                    "notStarted": 0,
                    "overdue": 0,
                    "onGoing": 1
                }
            }
        }
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Entity Report
      * @method
      * @name entity
      * @param {Object} req - request data.
      * @param {String} req.params._id - Entity id.
      * @returns {JSON} enity report details.
     */
    async entity(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const entityReports = await reportsHelper.entityV2(
                    req.params._id,
                    req.userDetails.userInformation.userId,
                    req.userDetails.userToken,
                    req.userDetails.userInformation.userName,
                    req.query.reportType,
                    req.query.programId ? req.query.programId : "",
                    req.query.requestPdf ? (req.query.requestPdf).toLowerCase() =="true" ? true :false : false,
                );
                
                return resolve({
                    message: entityReports.message,
                    result: entityReports.data
                });

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
                    errorObject: error
                });
            }
        })
    }

   

    /**
    * @api {get} /improvement-project/api/v2/reports/detailView/:_id?requestPdf=:requestPdf&programId=:programId&reportType=:reportType
    * Get detail view report
    * @apiVersion 1.0.0
    * @apiGroup Reports
    * @apiSampleRequest /improvement-project/api/v2/reports/detailView/5f731631e8d7cd3b88ac0659?requestPdf=false&programId=5da5a3af6ee4a93ce5a1987a&reportType=1
    * @apiParamExample {json} Response:
    * {
      message: "Chart report data generated succesfully.",
      status: 200,
      result: [
      {
        title: "Improvement project 1",
        plantingDays: "2015-04-01 00:00:00.000",
​        taskArr: [
          {
            task: "Task 1",
            startDate: "2018-04-02 00:00:00.000",
            endDate: "2018-06-08 00:00:00.000"
          },
          {
            task: "Task 2",
            startDate: "2018-07-08 00:00:00.000",
            endDate: "2021-07-19 00:00:00.000"
          },
          {
            task: "Task 3",
            startDate: "2018-07-29 00:00:00.000",
            endDate: "2019-05-08 00:00:00.000"
          }
        ],
        labels: ["Task 1", "Task 2", "Task 3"],
        datasets: [
          {
            data: [1097, 1194, 1215],
            datalabels: {
              color: "#025ced"
            },
            backgroundColor: "rgba(63,103,126,0)",
            hoverBackgroundColor: "rgba(50,90,100,0)"
          },
          {
            data: [67, 1107, 283],
            datalabels: {
              color: "#025ced"
            }
          }
        ]
      }
    */

    /**
      * Get details view report data
      * @method
      * @name detailView
      * @param {Object} req - request data.
      * @param {String} req.params._id - Entity id.
      * @returns {JSON} view report chart data
    */
    async detailView(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const entities = await reportsHelper.detailViewV2(
                    req.userDetails.userInformation.userId,
                    req.userDetails.userToken,
                    req.query.reportType,
                    req.params._id,
                    req.query.programId ? req.query.programId : "",
                    req.query.requestPdf ? (req.query.requestPdf).toLowerCase() =="true" ? true :false : false,
                );
                return resolve({
                    message: entities.message,
                    result: entities.data
                });

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