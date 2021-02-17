/**
 * name : v1.js
 * author : Deepa
 * created-date : 16-Feb-2021
 * Description : Report.
 */

module.exports = (req) => {

    let reportsValidator = {
        entity : function () {
            req.checkQuery("reportType").exists().withMessage("required report type");
        },
        detailView : function () {
            req.checkQuery("reportType").exists().withMessage("required report type");
        }

    }

    if (reportsValidator[req.params.method]) {
        reportsValidator[req.params.method]();
    }

};