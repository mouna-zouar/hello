const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
    clientId: 'salary-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'salary-service-group' });


const pendingEmployeeRequests = new Map();



const initKafkaRequestResponse = async () => {
    try {
        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({ topic: 'employee-existence-response', fromBeginning: false });

        console.log("✅ Consumer Kafka connecté dans salary-service");

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                const parsed = JSON.parse(message.value.toString());
                const { correlationId, exists } = parsed;

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
        console.error("❌ Erreur Kafka dans salary-service :", error);
    }
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


const closeKafkaConnection = async () => {
    await producer.disconnect();
    await consumer.disconnect();
};

module.exports = {
    initKafkaRequestResponse,
    closeKafkaConnection,
    checkEmployeeExistence
};
