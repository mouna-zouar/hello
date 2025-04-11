const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
    clientId: 'backlog-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'backlog-service-group' });

const pendingProjectRequests = new Map();

const initKafkaRequestResponse = async () => {
    try {
        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({ topic: 'project-existence-response', fromBeginning: false });

        console.log("✅ Consumer Kafka connecté dans backlog-service");

        await consumer.run({
            eachMessage: async ({ message }) => {
                const parsed = JSON.parse(message.value.toString());
                console.log(`📩 Réponse reçue:`, parsed);

                const { correlationId, backlogId, exists } = parsed;
                const resolve = pendingProjectRequests.get(correlationId);
                if (resolve) {
                    resolve({ backlogId, exists });
                    pendingProjectRequests.delete(correlationId);
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur Kafka backlog-service :", error);
    }
};

const checkProjectExistence = async (projectId) => {
    const correlationId = uuidv4();
    const payload = { projectId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingProjectRequests.set(correlationId, resolve);
    });

    await producer.send({
        topic: 'get-project-by-id',
        messages: [{ value: JSON.stringify(payload) }],

    });

    console.log("📤 Message envoyé :", payload);

    return responsePromise;
};

const closeKafkaConnection = async () => {
    await producer.disconnect();
    await consumer.disconnect();
};

module.exports = {
    initKafkaRequestResponse,
    checkProjectExistence,
    closeKafkaConnection,
};
