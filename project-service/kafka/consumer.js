const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'project-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'project-service-group2' });
const producer = kafka.producer();

const startConsumer = async () => {
    try {
        await consumer.connect();
        console.log("✅ Consumer connecté à Kafka");

        await producer.connect();

        await consumer.subscribe({ topic: 'get-project-by-id', fromBeginning: false });
        console.log("🎧 Consumer Kafka connecté et abonné au topic 'get-project-by-id'");

        console.log("✅ Consumer Kafka connecté dans project-service");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const rawMessage = message.value.toString();
                    console.log(`📩 Message reçu sur ${topic} :`, rawMessage);

                    const data = JSON.parse(rawMessage);
                    const projectId = parseInt(data.projectId);
                    const correlationId = data.correlationId;

                    console.log("🔎 Recherche du projet ID :", projectId);

                    const project = await prisma.project.findUnique({
                        where: { id: projectId },
                    });

                    const responseMessage = {
                        correlationId,
                        projectId: project ? project.id : null,
                        exists: !!project,
                    };

                    await producer.send({
                        topic: 'project-existence-response',
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
