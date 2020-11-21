/**
 * name : v1.js
 * author : Rakesh
 * created-date : 01-Nov-2020
 * Description : Report.
 */

module.exports = (req) => {

    let solutionValidator = {
        details : function () {
            req.checkParams('_id').exists().withMessage("required project id");
            req.checkQuery('taskId').exists().withMessage("required task id");
        }
    }

    if (solutionValidator[req.params.method]) {
        solutionValidator[req.params.method]();
    }

};