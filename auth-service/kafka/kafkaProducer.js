const kafka = require('./kafkaClient');
const producer = kafka.producer();

const produceEvent = async (topic, data) => {
    await producer.connect();
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(data) }],
    });
    await producer.disconnect();
};

module.exports = produceEvent;
