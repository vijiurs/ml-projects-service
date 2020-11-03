/**
 * name : v1.js
 * author : Rakesh
 * created-date : 01-Nov-2020
 * Description : Report.
 */

module.exports = (req) => {

    let reportsValidator = {

    }

    if (reportsValidator[req.params.method]) {
        reportsValidator[req.params.method]();
    }

};