/**
 * name : v1.js
 * author : Aman
 * created-date : 20-Nov-2020
 * Description : Tasks validator.
 */

module.exports = (req) => {

    let tasksValidator = {
        status : function () {
            req.checkParams('_id').exists().withMessage("required project id");
        }
    }

    if (tasksValidator[req.params.method]) {
        tasksValidator[req.params.method]();
    }

};