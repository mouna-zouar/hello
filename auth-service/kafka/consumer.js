const kafka = require('./kafkaClient');
const consumer = kafka.consumer({ groupId: 'auth-service' });
const producer = kafka.producer();
const { getUserById } = require('../controllers/userControllers');

const startUserExistenceConsumer = async () => {
    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic: 'user-existence-check', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const { userId, correlationId } = JSON.parse(message.value.toString());
            const user = await getUserById(userId);

            const exists = !!user;

            await producer.send({
                topic: 'user-existence-response',
                messages: [
                    {
                        value: JSON.stringify({
                            userId,
                            exists,
                            correlationId,
                        }),
                    },
                ],
            });
        },
    });
};

module.exports = { startUserExistenceConsumer };
