const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'backlog-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'backlog-service-group2' });
const producer = kafka.producer();

const startConsumer = async () => {
    try {
        await consumer.connect();
        console.log("✅ Consumer connecté à Kafka");

        await producer.connect();

        await consumer.subscribe({ topic: 'get-backlog-by-id', fromBeginning: false });
        console.log("🎧 Consumer Kafka connecté et abonné au topic 'get-backlog-by-id'");

        console.log("✅ Consumer Kafka connecté dans backlog-service");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const rawMessage = message.value.toString();
                    console.log(`📩 Message reçu sur ${topic} :`, rawMessage);

                    const data = JSON.parse(rawMessage);

                    if (!data.correlationId || !data.backlogId) {
                        console.error("❌ Message reçu invalide, données manquantes");
                        return;
                    }

                    const backlogId = parseInt(data.backlogId);
                    const correlationId = data.correlationId;

                    console.log("🔎 Recherche du backlog ID :", backlogId);

                    const backlog = await prisma.backlog.findUnique({
                        where: { id: backlogId },
                    });

                    const responseMessage = {
                        correlationId,
                        backlogId: backlog ? backlog.id : null,
                        exists: !!backlog,
                    };

                    await producer.send({
                        topic: 'backlog-existence-response',
                        messages: [{ value: JSON.stringify(responseMessage) }],
                    });

                    console.log("📤 Réponse envoyée :", responseMessage);
                } catch (err) {
                    console.error("❌ Erreur lors du traitement du message :", err);
                }
            },
        });

    } catch (error) {
        console.error("❌ Erreur Kafka backlog-service :", error);
    }
};

module.exports = { startConsumer };
