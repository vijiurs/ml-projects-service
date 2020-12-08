/**
 * name : v1.js
 * author : Aman
 * created-date : 05-Aug-2020
 * Description : Projects templates tasks validation.
 */

module.exports = (req) => {

    let templateTasksValidator = {

        bulkCreate : function () {
            req.checkParams('_id')
            .exists()
            .withMessage("required project template id");
        }
    }

    if (templateTasksValidator[req.params.method]) {
        templateTasksValidator[req.params.method]();
    }

};