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
    * @api {post} /improvement-project/api/v1/reports/entity/:_id
    * Entity Report.
    * @apiVersion 1.0.0
    * @apiGroup Reports
    * @apiSampleRequest /improvement-project/api/v1/reports/entity/5f731631e8d7cd3b88ac0659
    * @apiParamExample {json} Request:
     {
        "reportType":"lastMonth",
        "programId":"5da5a3af6ee4a93ce5a1987a"
      }
    * @apiParamExample {json} Response:
    * {
    "message": "Reports generated successfully.",
    "status": 200,
    "result": {
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
      * @param {String} req.params._id - Entity id.
      * @returns {JSON} enity report details.
     */
    async entity(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const entityReports = await reportsHelper.entity(
                    req.params._id,
                    req.userDetails.userInformation.userId,
                    req.body.reportType,
                    req.body.programId ? req.body.programId : "",
                );

                return resolve(entityReports);

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
    * @api {get} /improvement-project/api/v1/reports/getTypes
    * Get report types.
    * @apiVersion 1.0.0
    * @apiGroup Reports
    * @apiSampleRequest /improvement-project/api/v1/reports/getTypes
    * @apiParamExample {json} Response:
    * {
        "message": "Report types fetched successfully.",
        "status": 200,
        "result": [
            {
                "label": "Last Month",
                "value": 1
            },
            {
                "label": "Last Quarter",
                "value": 3
            }
        ]
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Get entity types
      * @method
      * @name getTypes
      * @param {Object} req - request data.
      * @returns {JSON} enity report details.
     */
    async getTypes(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const reportTypes = await reportsHelper.getTypes();
                return resolve(reportTypes);

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
    * @api {get} /improvement-project/api/v1/reports/getProgramsByEntity/:_id
    * Get programs by entity.
    * @apiVersion 1.0.0
    * @apiGroup Reports
    * @apiSampleRequest /improvement-project/api/v1/reports/getProgramsByEntity/5ddf79ff47e9260268c9547a?page=1&limi1=10&search=a
    * @apiParamExample {json} Response:
    * {
    "message": "Programs fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "name": "School Improvement Project",
                "_id": "5da5a3af6ee4a93ce5a1987a"
            },
            {
                "name": "School Improvement Project",
                "_id": "5da5a3af6ee4a93ce5a1987a"
            },
            {
                "name": "School Improvement Project",
                "_id": "5da5a3af6ee4a93ce5a1987a"
            }
        ],
        "count": 3
    }
}
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Get programs by entity
      * @method
      * @name getProgramsByEntity
      * @param {Object} req - request data.
      * @param {String} req.params._id - Entity id.
      * @returns {JSON} enity report details.
     */
    async getProgramsByEntity(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const entities = await reportsHelper.getProgramsByEntity(
                    req.userDetails.userInformation.userId,
                    req.params._id,
                    req.pageSize,
                    req.pageNo,
                    req.searchText
                );
                return resolve(entities);

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