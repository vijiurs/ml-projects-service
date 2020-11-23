/**
 * name : v1.js
 * author : Aman
 * created-date : 25-Aug-2020
 * Description : Projects.
 */

module.exports = (req) => {

    let projectsValidator = {

        createSelf : function () {
            req.checkBody('title').exists().withMessage("required project title");
            req.checkBody('categories').exists().withMessage("required categories for project");
        },
        importFromLibrary : function () {
            req.checkParams('_id').exists().withMessage("required project template id");
        },
        sync : function () {
            req.checkParams('_id').exists().withMessage("required project id");
            req.checkQuery('lastDownloadedAt').exists().withMessage("required last downloaded at");
        },
        details : function () {
            req.checkParams('_id').exists().withMessage("required project id");
        },
        tasksStatus : function () {
            req.checkParams('_id').exists().withMessage("required project id");
        },
        solutionDetails : function () {
            req.checkParams('_id').exists().withMessage("required project id");
            req.checkQuery('taskId').exists().withMessage("required task id");
        }
    }

    if (projectsValidator[req.params.method]) {
        projectsValidator[req.params.method]();
    }

};