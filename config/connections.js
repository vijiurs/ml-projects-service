/**
 * name : index.js
 * author : Aman Karki
 * created-date : 13-July-2020
 * Description : Configurations related information.
*/

/**
  * Mongodb Database configuration.
  * @function
  * @name mongodb_connect
  * @param {Object} configuration - mongodb database configuration.
*/

const mongodb_connect = function (configuration) {
  
  global.database = require("./db/mongodb")(
    configuration
  );

  global.ObjectId = database.ObjectId;
  global.Abstract = require("../generics/abstract");
};

// Configuration data.

const configuration = {
  mongodb: {
    host : process.env.MONGODB_URL,
    port : process.env.MONGODB_PORT,
    database : process.env.MONGODB_DATABASE_NAME
  }
};

mongodb_connect(configuration.mongodb);

module.exports = configuration;
