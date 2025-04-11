const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'employee-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'employee-service-group2' });
const producer = kafka.producer();

const startConsumer = async () => {
    try {
        await consumer.connect();
        console.log("✅ Consumer connecté à Kafka");

        await producer.connect();

        await consumer.subscribe({ topic: 'get-employee-by-id', fromBeginning: false });
        console.log("🎧 Consumer Kafka connecté et abonné au topic 'get-employee-by-id'");

        console.log("✅ Consumer Kafka connecté dans employee-service");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const rawMessage = message.value.toString();
                    console.log(`📩 Message reçu sur ${topic} :`, rawMessage);

                    const data = JSON.parse(rawMessage);
                    const employeeId = parseInt(data.employeeId);
                    const correlationId = data.correlationId;

                    console.log("🔎 Recherche du employeeId :", employeeId);

                    const employee = await prisma.employee.findUnique({
                        where: { id: employeeId },
                    });

                    const responseMessage = {
                        correlationId,
                        employeeId: employee ? employee.id : null,
                        exists: !!employee,
                    };

                    await producer.send({
                        topic: 'employee-existence-response',
                        messages: [{ value: JSON.stringify(responseMessage) }],
                    });

                    console.log("📤 Réponse envoyée :", responseMessage);
                } catch (err) {
                    console.error("❌ Erreur lors du traitement du message :", err);
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur Kafka employee-service :", error);
    }
};

module.exports = { startConsumer };
