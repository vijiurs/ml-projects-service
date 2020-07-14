/**
 * name : index.js
 * author : Aman Karki
 * created-date : 13-July-2020
 * Description : Configurations related information.
*/

/**
  * Mongodb Database configuration.
  * @function
  * @name db_connect
  * @param {Object} mongodbConfiguration - mongodb database configuration.
*/

let db_connect = function (mongodbConfiguration) {
  
  global.database = require("./db/mongodb")(
    mongodbConfiguration
  );

  global.ObjectId = database.ObjectId;
  global.Abstract = require("../generics/abstract");
};

// Configuration data.

const configuration = {
  root: require("path").normalize(__dirname + "/.."),
  app: {
    name: process.env.appName
  },
  port: process.env.PORT,
  log: process.env.LOG,
  db: {
    connection: {
      mongodb: {
        host: process.env.MONGODB_URL,
        database: process.env.DB,
        options: {
          useNewUrlParser: true
        }
      }
    }
  },
  version: process.env.VERSION,
  URLPrefix: process.env.URL_PREFIX,
  webUrl: process.env.WEB_URL
};

db_connect(configuration.db.connection.mongodb);

module.exports = configuration;
