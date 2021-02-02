/**
 * name : health.js.
 * author : Aman Karki.
 * created-date : 01-Feb-2021.
 * Description : Health check helper functionality.
*/

const mongoose = require("mongoose");
const kafka = require('kafka-node');
const { v4 : uuidv4 } = require('uuid');

const obj = {
    LEARNER_SERVICE: {
      NAME: 'learnerservice.api',
      FAILED_CODE: 'LEARNER_SERVICE_HEALTH_FAILED',
      FAILED_MESSAGE: 'Learner service is not healthy'
    },
    KAFKA: {
      NAME: 'kafka',
      FAILED_CODE: 'KAFKA_HEALTH_FAILED',
      FAILED_MESSAGE: 'Kafka is not connected'
    },
    MONGO_DB: {
      NAME: 'Mongo.db',
      FAILED_CODE: 'MONGODB_HEALTH_FAILED',
      FAILED_MESSAGE: 'Mongo db is not connected'
    },
    NAME: 'ImprovementServiceHealthCheck',
    API_VERSION: '1.0'
  }

function mongodb_connect() {
    return new Promise( async (resolve,reject) => {

        const db = mongoose.createConnection(
            process.env.MONGODB_URL + ":" + process.env.MONGODB_PORT + "/" + process.env.MONGODB_DATABASE_NAME
        );
          
        db.on("error", function () {
            return resolve(false)
        });
        db.once("open", function() {
            return resolve(true);    
        });
    })
}

function kafka_connect() {
    return new Promise( async (resolve,reject) => {

        const client = new kafka.KafkaClient({
            kafkaHost : process.env.KAFKA_URL
        });      
          
        client.on('error', function(error) {
            return resolve(false);
        });

        const producer = new Producer(client)

        producer.on('ready', function () {
            return resolve(true);
        });
    })
}

let checkHealth = async function(req,res) {

    let checks = [];
    let mongodbConnection = await mongodb_connect();
    let kafkaConnection = await kafka_connect();
    checks.push(singleCheckObj("KAFKA",kafkaConnection));
    checks.push(singleCheckObj("MONGO_DB",mongodbConnection));

    let checkServices = checks.filter( check => check.healthy === false);

    let result = {
        name : obj.NAME,
        version : obj.API_VERSION,
        healthy : checkServices.length > 0 ? false : true,
        checks : checks
    };

    let responseData = response(req,result);
    res.status(200).json(responseData);
}

let singleCheckObj = function( serviceName,isHealthy ) {
    return {
        name : obj[serviceName].NAME,
        healthy : isHealthy,
        err : !isHealthy ?  obj[serviceName].FAILED_CODE : "",
        errMsg : !isHealthy ? obj[serviceName].FAILED_MESSAGE : ""
    }
}

let response = function ( req,result ) {
    return {
        "id" : "improvementService.Health.API",
        "ver" : "1.0",
        "ts" : new Date(),
        "params" : {
            "resmsgid" : uuidv4(),
            "msgid" : req.headers['msgid'] || req.headers.msgid || uuidv4(),
            "status" : "successful",
            "err" : "null",
            "errMsg" : "null"
        },
        "responseCode" : "200",
        result : result
    }
}

module.exports = {
    checkHealth : checkHealth
}