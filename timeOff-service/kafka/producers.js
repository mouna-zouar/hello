const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
    clientId: 'timeoff-service',
    brokers: ['localhost:9092'],
});

let consumer;
let producer;
let producerReady = false;
const pendingEmployeeRequests = new Map();

const initKafkaRequestResponse = async () => {
    try {
        // Initialisation du Producteur Kafka
        producer = kafka.producer();
        await producer.connect(); // Connexion du producteur Kafka
        producerReady = true;
        console.log("✅ Producer Kafka connecté dans timeoff-service");

        // Initialisation du Consommateur Kafka
        consumer = kafka.consumer({ groupId: 'timeoff-service-group1' });
        await consumer.connect();
        await consumer.subscribe({ topic: 'employee-existence-response', fromBeginning: false });
        console.log("✅ Consumer Kafka connecté dans timeoff-service");

        // Consommation des messages Kafka
        await consumer.run({
            eachMessage: async ({ message }) => {
                const parsed = JSON.parse(message.value.toString());
                const { correlationId, employeeId, exists } = parsed;

                if (employeeId !== undefined && exists !== undefined) {
                    const resolve = pendingEmployeeRequests.get(correlationId);
                    if (resolve) {
                        resolve({ employeeId, exists });
                        pendingEmployeeRequests.delete(correlationId);
                    }
                }
            },
        });
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de Kafka :", error);
        producerReady = false;
    }
};

const waitForProducer = async () => {
    let retries = 10;
    while (!producerReady && retries > 0) {
        console.log("⏳ Attente de l'initialisation du Producer...");
        if (!producer) {
            console.log("🔄 Tentative de connexion du Producer Kafka...");
            try {
                producer = await kafka.producer();
                await producer.connect();
                producerReady = true;
                console.log("✅ Producer Kafka connecté avec succès");
            } catch (error) {
                console.error("❌ Échec de la connexion du Producer Kafka", error);
            }
        }

        if (producerReady) {
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        retries--;
    }

    if (!producerReady) {
        throw new Error("⛔ Timeout : Producer Kafka toujours non initialisé après plusieurs tentatives !");
    }
};

const waitForConsumer = async () => {
    let retries = 10;
    while (retries > 0) {
        console.log("⏳ Attente de l'initialisation du Consumer...");

        if (!consumer) {
            console.log("🔄 Tentative de connexion du Consumer Kafka...");
            try {
                consumer = kafka.consumer({ groupId: 'timeoff-service-group1' });
                await consumer.connect();
                await consumer.subscribe({ topic: 'employee-existence-response', fromBeginning: false });
                console.log("✅ Consumer Kafka connecté avec succès");
            } catch (error) {
                console.error("❌ Échec de la connexion du Consumer Kafka", error);
            }
        } else {
            // Si le consommateur est déjà initialisé, on vérifie si la connexion est active
            if (consumer.isConnected) {
                console.log("✅ Consumer Kafka déjà connecté");
                break;  // Sortir de la boucle si le consommateur est connecté
            } else {
                console.log("🔄 Tentative de reconnection du Consumer Kafka...");
            }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        retries--;
    }

    if (!consumer || !consumer.isConnected) {
        throw new Error("⛔ Timeout : Consumer Kafka toujours non initialisé après plusieurs tentatives !");
    }
};


const checkEmployeeExistence = async (employeeId) => {
    await waitForProducer();
    await waitForConsumer();

    if (!producerReady) {
        console.error("❌ Kafka producer non initialisé, réessayez plus tard !");
        throw new Error("❌ Kafka producer non initialisé !");
    }

    const correlationId = uuidv4();
    const payload = { employeeId, correlationId };

    const responsePromise = new Promise(async (resolve, reject) => {
        pendingEmployeeRequests.set(correlationId, resolve);

        try {
            await producer.send({
                topic: 'get-employee-by-id',
                messages: [{ value: JSON.stringify(payload) }],
            });
            console.log("✅ Message envoyé au topic 'get-employee-by-id'", payload);
        } catch (error) {
            console.error("❌ Erreur lors de l'envoi du message Kafka :", error);
            reject(new Error("Erreur d'envoi du message Kafka"));
        }
    });

    // Assurez-vous que le consommateur est prêt à écouter les messages
    consumer.on('message', async (message) => {
        const response = JSON.parse(message.value);
        console.log(`Réponse reçue du Kafka pour la vérification de l'employé: ${JSON.stringify(response)}`);

        if (response.correlationId === correlationId) {
            console.log(`Réponse pour l'employé avec ID: ${employeeId} trouvée`);
            const resolveCallback = pendingEmployeeRequests.get(correlationId);
            if (resolveCallback) {
                resolveCallback(response);
                pendingEmployeeRequests.delete(correlationId);
            }
        }
    });

    return responsePromise;
};

const closeKafkaConnection = async () => {
    await producer.disconnect();
    await consumer.disconnect();
    producerReady = false;
};

module.exports = {
    initKafkaRequestResponse,
    checkEmployeeExistence,
    closeKafkaConnection,
};
