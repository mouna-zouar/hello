const express = require('express');
const bodyParser = require('body-parser');
const teamRoutes = require('./Routes/teamRoutes');
const { startTeamExistenceConsumer } = require('./kafka/consumer');
const setupSwagger = require('./config/swagger');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3004;
app.use(bodyParser.json());

app.use('/teams', teamRoutes);
setupSwagger(app);

app.listen(port, async () => {
    console.log(`Team service running on port ${port}`);
    try {
        await startTeamExistenceConsumer();
        console.log('Kafka consumer démarré pour vérifier les utilisateurs');
    } catch (error) {
        console.error("Erreur lors du démarrage du consommateur Kafka :", error);
    }
});
