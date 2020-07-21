/**
 * name : forms.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for forms.
 */

module.exports = {
    name: "forms",
    schema: {
        name : {
            type : String,
            required : true
        },
        attributes : {
            type : Array,
            default : []
        }
    }
};