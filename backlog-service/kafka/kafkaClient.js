const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'backlog-service',
    brokers: ['localhost:9092'],
});

module.exports = kafka;
