const kafka = require('./kafkaClient');
const { v4: uuidv4 } = require('uuid');

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'employee-service' });

const pendingUserRequests = new Map();
const pendingTeamRequests = new Map();

const initKafkaRequestResponse = async () => {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe({ topic: 'user-existence-response', fromBeginning: false });
    await consumer.subscribe({ topic: 'team-existence-response', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const parsed = JSON.parse(message.value.toString());
            const { correlationId } = parsed;

            if (parsed.userId !== undefined && parsed.exists !== undefined) {
                const resolve = pendingUserRequests.get(correlationId);
                if (resolve) {
                    resolve({ userId: parsed.userId, exists: parsed.exists });
                    pendingUserRequests.delete(correlationId);
                }
            }

            if (parsed.teamId !== undefined && parsed.exists !== undefined) {
                const resolve = pendingTeamRequests.get(correlationId);
                if (resolve) {
                    resolve({ teamId: parsed.teamId, exists: parsed.exists });
                    pendingTeamRequests.delete(correlationId);
                }
            }
        },
    });
};

const checkUserExistence = async (userId) => {
    const correlationId = uuidv4();
    const payload = { userId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingUserRequests.set(correlationId, resolve);
    });

    await producer.send({
        topic: 'user-existence-check',
        messages: [{ value: JSON.stringify(payload) }],
    });

    return responsePromise;
};

const checkTeamExistence = async (teamId) => {
    const correlationId = uuidv4();
    const payload = { teamId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingTeamRequests.set(correlationId, resolve);
    });

    await producer.send({
        topic: 'team-existence-check',
        messages: [{ value: JSON.stringify(payload) }],
    });

    return responsePromise;
};

module.exports = {
    initKafkaRequestResponse,
    checkUserExistence,
    checkTeamExistence,
};
