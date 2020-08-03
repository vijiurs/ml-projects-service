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
        }
    }

    if (projectsValidator[req.params.method]) {
        projectsValidator[req.params.method]();
    }

};