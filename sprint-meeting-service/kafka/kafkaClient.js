const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'meeting-service',
    brokers: ['localhost:9092'],
});

module.exports = kafka;
