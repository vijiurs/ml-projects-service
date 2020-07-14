/**
 * name : abstract.js
 * author : Aman Karki.
 * Date : 13-July-2020
 * Description : Abstract class.
 */

 /**
    * Abstract
    * @class
*/

let Abstract = class Abstract {
  
  constructor(schema) {
    this.model = database.createModel(schema);
    this.schema = schema.name;
  }
};

module.exports = Abstract;
