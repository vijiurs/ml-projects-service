/**
 * name : kafka.js
 * author : Aman Karki
 * created-date : 08-Sep-2020
 * Description : Kafka Configurations related information.
*/


//dependencies
const kafka = require('kafka-node')

/**
  * Kafka configurations.
  * @function
  * @name connect
  * @param {Object} config - Kafka configurations data.
*/

const connect = function(config) {

    const Producer = kafka.Producer
    KeyedMessage = kafka.KeyedMessage
    
    const client = new kafka.KafkaClient({
      kafkaHost : config.host
    });

    client.on('error', function(error) {
        LOGGER.error("kafka connection error!")
    });

    const producer = new Producer(client)

    producer.on('ready', function () {
        LOGGER.info("Connected to Kafka");
    });
   
    producer.on('error', function (err) {
        LOGGER.error("kafka producer creation error!")
    })

    return {
      kafkaProducer: producer,
      kafkaClient: client
    };

};

module.exports = connect;
