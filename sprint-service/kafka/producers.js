const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
    clientId: 'sprint-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'sprint-service-group' });

const pendingBacklogRequests = new Map();
const pendingProjectRequests = new Map();


const initKafkaRequestResponse = async () => {
    try {
        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({ topic: 'backlog-existence-response', fromBeginning: false });
        await consumer.subscribe({ topic: 'project-existence-response', fromBeginning: false });

        console.log("✅ Consumer Kafka connecté dans sprint-service");

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                const parsed = JSON.parse(message.value.toString());
                const { correlationId, exists } = parsed;

                if (topic === 'backlog-existence-response') {
                    const resolve = pendingBacklogRequests.get(correlationId);
                    if (resolve) {
                        resolve({ backlogId: parsed.backlogId, exists });
                        pendingBacklogRequests.delete(correlationId);
                    }
                }

                if (topic === 'project-existence-response') {
                    const resolve = pendingProjectRequests.get(correlationId);
                    if (resolve) {
                        resolve({ projectId: parsed.projectId, exists });
                        pendingProjectRequests.delete(correlationId);
                    }
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur Kafka dans sprint-service :", error);
    }
};


const checkBacklogExistence = async (backlogId) => {
    const correlationId = uuidv4();
    const payload = { backlogId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingBacklogRequests.set(correlationId, resolve);
    });

    await producer.send({
        topic: 'get-backlog-by-id',
        messages: [{ value: JSON.stringify(payload) }],

    });

    console.log("📤 Message envoyé :", payload);

    return responsePromise;
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
    checkBacklogExistence,
    closeKafkaConnection,
    checkProjectExistence
};
