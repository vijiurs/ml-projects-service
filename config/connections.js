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

/**
  * Kafka connection.
  * @function
  * @name kafka_connect
  * @param {Object} kafkaConfiguration - Kafka configuration.
*/

const kafka_connect = function(kafkaConfiguration) {
  global.kafkaClient = require("./kafka")(kafkaConfiguration);
};

// Configuration data.

const configuration = {
  mongodb: {
    host : process.env.MONGODB_URL,
    port : process.env.MONGODB_PORT,
    database : process.env.MONGODB_DATABASE_NAME
  },
  kafka : {
    host: process.env.KAFKA_URL,
  }
};

mongodb_connect(configuration.mongodb);
kafka_connect(configuration.kafka);

module.exports = configuration;
