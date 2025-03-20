const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'employee-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'employee-service-group' });
let producer;

const startConsumer = async () => {
    try {
        console.log("Démarrage du consommateur Kafka dans employee-service");

        await consumer.connect();
        producer = kafka.producer();
        await producer.connect();

        await consumer.subscribe({ topic: 'get-employee-by-id', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Message reçu sur le topic ${topic} dans employee-service`);

                const data = JSON.parse(message.value.toString());
                const employeeId = data.employeeId;

                console.log(`Traitement du message pour employeeId: ${employeeId}`);

                const employee = await prisma.employee.findUnique({
                    where: { id: employeeId },
                });

                const responseMessage = {
                    correlationId: data.correlationId,
                    employeeId: employee ? employee.id : null,
                    exists: !!employee,
                };

                console.log(`Réponse envoyée:`, responseMessage);

                await producer.send({
                    topic: 'employee-existence-response',
                    messages: [
                        {
                            value: JSON.stringify(responseMessage),
                        },
                    ],
                });

                console.log("Réponse envoyée au topic 'employee-existence-response'");
            },
        });
    } catch (error) {
        console.error('Erreur lors du démarrage du consommateur Kafka dans employee-service:', error);
    }
};

module.exports = { startConsumer };
