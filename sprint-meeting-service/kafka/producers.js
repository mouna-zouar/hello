const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
    clientId: 'meeting-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'meeting-service-group' });

const pendingBacklogRequests = new Map();
const pendingProjectRequests = new Map();
const pendingSprintRequests = new Map();
const pendingEmployeeRequests = new Map();
const pendingTaskRequests = new Map();

const initKafkaRequestResponse = async () => {
    try {
        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({ topic: 'backlog-existence-response', fromBeginning: false });
        await consumer.subscribe({ topic: 'project-existence-response', fromBeginning: false });
        await consumer.subscribe({ topic: 'sprint-existence-response', fromBeginning: false });
        await consumer.subscribe({ topic: 'employee-existence-response', fromBeginning: false });
        await consumer.subscribe({ topic: 'task-existence-response', fromBeginning: false });

        console.log("✅ Consumer Kafka connecté dans meeting-service");

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                const parsed = JSON.parse(message.value.toString());
                const { correlationId, exists } = parsed;

                if (topic === 'task-existence-response') {
                    const resolve = pendingTaskRequests.get(correlationId);
                    if (resolve) {
                        resolve({ taskId: parsed.taskId, exists });
                        pendingTaskRequests.delete(correlationId);
                    }
                }

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

                if (topic === 'sprint-existence-response') {
                    const resolve = pendingSprintRequests.get(correlationId);
                    if (resolve) {
                        resolve({ sprintId: parsed.sprintId, exists });
                        pendingSprintRequests.delete(correlationId);
                    }
                }

                if (topic === 'employee-existence-response') {
                    const resolve = pendingEmployeeRequests.get(correlationId);
                    if (resolve) {
                        resolve({ employeeId: parsed.employeeId, exists });
                        pendingEmployeeRequests.delete(correlationId);
                    }
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur Kafka dans task-service :", error);
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

const checkSprintExistence = async (sprintId) => {
    const correlationId = uuidv4();
    const payload = { sprintId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingSprintRequests.set(correlationId, resolve);
    });

    await producer.send({
        topic: 'get-sprint-by-id',
        messages: [{ value: JSON.stringify(payload) }],

    });

    console.log("📤 Message envoyé :", payload);

    return responsePromise;
};

const checkEmployeeExistence = async (employeeId) => {
    const correlationId = uuidv4();
    const payload = { employeeId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingEmployeeRequests.set(correlationId, resolve);
    });

    await producer.send({
        topic: 'get-employee-by-id',
        messages: [{ value: JSON.stringify(payload) }],

    });

    console.log("📤 Message envoyé :", payload);

    return responsePromise;
};

const checkTaskExistence = async (taskId) => {
    const correlationId = uuidv4();
    const payload = { taskId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingTaskRequests.set(correlationId, resolve);
    });

    await producer.send({
        topic: 'get-task-by-id',
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
    checkSprintExistence,
    checkProjectExistence,
    checkEmployeeExistence,
    checkTaskExistence
};
