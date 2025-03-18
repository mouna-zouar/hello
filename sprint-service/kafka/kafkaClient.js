const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'sprint-service',
    brokers: ['localhost:9092'],
});

module.exports = kafka;
