const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'user-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'user-service-group2' });
const producer = kafka.producer();

const startConsumer = async () => {
    try {
        await consumer.connect();
        console.log("✅ Consumer connecté à Kafka");

        await producer.connect();

        await consumer.subscribe({ topic: 'user-existence-check', fromBeginning: false });
        console.log("🎧 Consumer Kafka connecté et abonné au topic 'get-user-by-id'");

        console.log("✅ Consumer Kafka connecté dans user-service");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const rawMessage = message.value.toString();
                    console.log(`📩 Message reçu sur ${topic} :`, rawMessage);

                    const data = JSON.parse(rawMessage);
                    const userId = parseInt(data.userId);
                    const correlationId = data.correlationId;

                    console.log("🔎 Recherche du user ID :", userId);

                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                    });

                    const responseMessage = {
                        correlationId,
                        userId: user ? user.id : null,
                        exists: !!user,
                    };

                    await producer.send({
                        topic: 'user-existence-response',
                        messages: [{ value: JSON.stringify(responseMessage) }],
                    });

                    console.log("📤 Réponse envoyée :", responseMessage);
                } catch (err) {
                    console.error("❌ Erreur lors du traitement du message :", err);
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur Kafka user-service :", error);
    }
};

module.exports = { startConsumer };
