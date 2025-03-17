const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const kafka = new Kafka({
    clientId: 'project-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'project-service-group' }); // Changez ici pour un groupId unique

const pendingEmployeeRequests = new Map();
const pendingTeamRequests = new Map();


const initKafkaRequestResponse = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'employee-existence-response', fromBeginning: false }); // Changer ici le topic

    await consumer.run({
        eachMessage: async ({ message }) => {
            const parsed = JSON.parse(message.value.toString());
            const { correlationId, employeeId, exists } = parsed;

            if (parsed.employeeId !== undefined && parsed.exists !== undefined) {
                const resolve = pendingEmployeeRequests.get(correlationId);
                if (resolve) {
                    resolve({ employeeId, exists });
                    pendingEmployeeRequests.delete(correlationId);
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

const checkEmployeeExistence = async (employeeId) => {
    const correlationId = uuidv4();
    const payload = { employeeId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingEmployeeRequests.set(correlationId, resolve);
    });

    await producer.send({
        topic: 'get-employee-by-id', // Topic pour envoyer la demande de vérification
        messages: [{ value: JSON.stringify(payload) }],
    });
    console.log("✅ Message envoyé au topic 'get-employee-by-id'", payload);

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

const closeKafkaConnection = async () => {
    await producer.disconnect();
    await consumer.disconnect();
};

module.exports = {
    initKafkaRequestResponse,
    checkEmployeeExistence,
    closeKafkaConnection,
    checkTeamExistence
};
