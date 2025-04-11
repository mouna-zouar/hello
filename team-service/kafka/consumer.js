const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'team-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'team-service-group2' });
const producer = kafka.producer();

const startConsumer = async () => {
    try {
        await consumer.connect();
        console.log("✅ Consumer connecté à Kafka");

        await producer.connect();

        await consumer.subscribe({ topic: 'team-existence-check', fromBeginning: false });
        console.log("🎧 Consumer Kafka connecté et abonné au topic 'team-existence-check'");

        console.log("✅ Consumer Kafka connecté dans team-service");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const rawMessage = message.value.toString();
                    console.log(`📩 Message reçu sur ${topic} :`, rawMessage);

                    const data = JSON.parse(rawMessage);
                    const teamId = parseInt(data.teamId);
                    const correlationId = data.correlationId;

                    console.log("🔎 Recherche du teamId :", teamId);

                    const team = await prisma.team.findUnique({
                        where: { id: teamId },
                    });

                    const responseMessage = {
                        correlationId,
                        teamId: team ? team.id : null,
                        exists: !!team,
                    };

                    await producer.send({
                        topic: 'team-existence-response',
                        messages: [{ value: JSON.stringify(responseMessage) }],
                    });

                    console.log("📤 Réponse envoyée :", responseMessage);
                } catch (err) {
                    console.error("❌ Erreur lors du traitement du message :", err);
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur Kafka team-service :", error);
    }
};

module.exports = { startConsumer };
