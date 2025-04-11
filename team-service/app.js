const express = require('express');
const bodyParser = require('body-parser');
const teamRoutes = require('./Routes/teamRoutes');
const { startConsumer } = require('./kafka/consumer');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3004;
app.use(bodyParser.json());

app.use('/api/teams', teamRoutes);

app.listen(port, async () => {
    console.log(`Team service running on port ${port}`);
    try {
        await startConsumer();
        console.log('Kafka consumer démarré pour vérifier les utilisateurs');
    } catch (error) {
        console.error("Erreur lors du démarrage du consommateur Kafka :", error);
    }
});
