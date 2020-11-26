/**
 * name : v1.js
 * author : Aman
 * created-date : 05-Aug-2020
 * Description : Projects categories validation.
 */

module.exports = (req) => {

    let projectsValidator = {
        projectDetails: function () {
            req.checkParams('_id')
            .exists()
            .withMessage("required project id");
        }
    }

    if (projectsValidator[req.params.method]) {
        projectsValidator[req.params.method]();
    }

};