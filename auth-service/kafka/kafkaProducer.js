const kafka = require('./kafkaClient');
const producer = kafka.producer();

const produceEvent = async (topic, data) => {
    try {
        await producer.connect();
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(data) }],
        });
        await producer.disconnect();
    } catch (err) {
        console.error(`Erreur lors de l'envoi de l'événement "${topic}" :`, err);
    }
};

module.exports = produceEvent;
