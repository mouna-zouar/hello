const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const kafka = new Kafka({
    clientId: 'project-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'project-service-group2' }); // Changez ici pour un groupId unique

const pendingEmployeeRequests = new Map();
const pendingTeamRequests = new Map();
const pendingBacklogRequests = new Map();



const initKafkaRequestResponse = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'employee-existence-response', fromBeginning: false }); // Changer ici le topic
    await consumer.subscribe({ topic: 'team-existence-response', fromBeginning: false }); // Abonnement au topic de réponse de l'équipe
    await consumer.subscribe({ topic: 'backlog-existence-response', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const parsed = JSON.parse(message.value.toString());
            const { correlationId, exists } = parsed;

            if (parsed.employeeId !== undefined && parsed.exists !== undefined) {
                const resolve = pendingEmployeeRequests.get(correlationId);
                if (resolve) {
                    resolve({ employeeId:parsed.employeeId, exists: parsed.exists });
                    pendingEmployeeRequests.delete(correlationId);
                }
            }


            if (parsed.backlogId !== undefined && parsed.exists !== undefined) {
                const resolve = pendingBacklogRequests.get(correlationId);
                console.log("📥 Message complet reçu pour backlog-existence-response:", parsed);

                if (resolve) {
                    resolve({ backlogId: parsed.backlogId, exists: parsed.exists });
                     pendingBacklogRequests.delete(correlationId);
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
        pendingTeamRequests.set(correlationId, (result) => {
            console.log("✅ Réponse reçue pour checkTeamExistence:", result);
            resolve(result);
        });
    });

    await producer.send({
        topic: 'team-existence-check',
        messages: [{ value: JSON.stringify(payload) }],
    });

    console.log("📤 Demande envoyée (team-existence-check):", payload);

    return responsePromise;
};

const checkBacklogExistence = async (backlogId) => {
    const correlationId = uuidv4();
    const payload = { backlogId, correlationId };

    const responsePromise = new Promise((resolve) => {
        pendingBacklogRequests.set(correlationId, (result) => {
            console.log("✅ Réponse reçue pour checkBacklogExistence:", result);
            resolve(result);
        });
    });

    await producer.send({
        topic: 'get-backlog-by-id',
        messages: [{ value: JSON.stringify(payload) }],
    });

    console.log("📤 Demande envoyée (get-backlog-by-id):", payload);

    return responsePromise;
};


const closeKafkaConnection = async () => {
    await producer.disconnect();
    await consumer.disconnect();
};

module.exports = {
    initKafkaRequestResponse,
    checkEmployeeExistence,
    checkBacklogExistence,
    closeKafkaConnection,
    checkTeamExistence
};
