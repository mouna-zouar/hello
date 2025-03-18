const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'timeoff-service',
    brokers: ['localhost:9092'],
});

module.exports = kafka;
