const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'sprint-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'sprint-service-group2' });
const producer = kafka.producer();

const startConsumer = async () => {
    try {
        await consumer.connect();
        console.log("✅ Consumer connecté à Kafka");

        await producer.connect();

        await consumer.subscribe({ topic: 'get-sprint-by-id', fromBeginning: false });
        console.log("🎧 Consumer Kafka connecté et abonné au topic 'get-sprint-by-id'");

        console.log("✅ Consumer Kafka connecté dans sprint-service");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const rawMessage = message.value.toString();
                    console.log(`📩 Message reçu sur ${topic} :`, rawMessage);

                    const data = JSON.parse(rawMessage);
                    const sprintId = parseInt(data.sprintId);
                    const correlationId = data.correlationId;

                    console.log("🔎 Recherche du sprint ID :", sprintId);

                    const sprint = await prisma.sprint.findUnique({
                        where: { id: sprintId },
                    });

                    const responseMessage = {
                        correlationId,
                        projectId: sprint ? sprint.id : null,
                        exists: !!sprint,
                    };

                    await producer.send({
                        topic: 'sprint-existence-response',
                        messages: [{ value: JSON.stringify(responseMessage) }],
                    });

                    console.log("📤 Réponse envoyée :", responseMessage);
                } catch (err) {
                    console.error("❌ Erreur lors du traitement du message :", err);
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur Kafka project-service :", error);
    }
};

module.exports = { startConsumer };
