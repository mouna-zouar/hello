const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'task-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'task-service-group2' });
const producer = kafka.producer();

const startConsumer = async () => {
    try {
        await consumer.connect();
        console.log("✅ Consumer connecté à Kafka");

        await producer.connect();

        await consumer.subscribe({ topic: 'get-task-by-id', fromBeginning: false });
        console.log("🎧 Consumer Kafka connecté et abonné au topic 'get-task-by-id'");

        console.log("✅ Consumer Kafka connecté dans task-service");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const rawMessage = message.value.toString();
                    console.log(`📩 Message reçu sur ${topic} :`, rawMessage);

                    const data = JSON.parse(rawMessage);
                    const taskId = parseInt(data.taskId);
                    const correlationId = data.correlationId;

                    console.log("🔎 Recherche du task ID :", taskId);

                    const task = await prisma.task.findUnique({
                        where: { id: taskId },
                    });

                    const responseMessage = {
                        correlationId,
                        projectId: task ? task.id : null,
                        exists: !!task,
                    };

                    await producer.send({
                        topic: 'task-existence-response',
                        messages: [{ value: JSON.stringify(responseMessage) }],
                    });

                    console.log("📤 Réponse envoyée :", responseMessage);
                } catch (err) {
                    console.error("❌ Erreur lors du traitement du message :", err);
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur Kafka task-service :", error);
    }
};

module.exports = { startConsumer };
