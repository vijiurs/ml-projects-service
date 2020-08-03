/**
 * name : v1.js
 * author : Aman
 * created-date : 31-July-2020
 * Description : Projects templates validation.
 */

module.exports = (req) => {

    let projectTemplateValidator = {

        importFromTemplates : function () {
            req.checkParams('_id')
            .exists()
            .withMessage("required project template id");
        }
    }

    if (projectTemplateValidator[req.params.method]) {
        projectTemplateValidator[req.params.method]();
    }

};