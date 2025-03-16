const kafka = require('./kafkaClient');
const consumer = kafka.consumer({ groupId: 'employee-service' });
const producer = kafka.producer();
const { getTeamById } = require('../controllers/teamController');

const startTeamExistenceConsumer = async () => {
    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic: 'team-existence-check', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const messageValue = message.value ? message.value.toString() : null;

            if (!messageValue) {
                console.error('❌ Message reçu vide ou mal formaté');
                return;
            }

            try {
                const parsed = JSON.parse(messageValue);
                const { correlationId, teamId } = parsed;

                console.log("🧪 Reçu teamId =", teamId);

                const result = await getTeamById(teamId);

                await producer.send({
                    topic: 'team-existence-response',
                    messages: [{
                        value: JSON.stringify({
                            correlationId,
                            teamId,
                            exists: result.exists
                        })
                    }]
                });
            } catch (error) {
                console.error("❌ Erreur lors du traitement du message:", error);
            }
        }
    });
};

module.exports = { startTeamExistenceConsumer };
