const express = require('express');
const bodyParser = require('body-parser');
const timeOffRoutes = require('./Routes/timeOffRoutes');
const {initKafkaRequestResponse} = require('./Kafka/producers');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/timeoffs', timeOffRoutes);

(async () => {
    console.log("⏳ Initialisation de Kafka...");
    await initKafkaRequestResponse();
    console.log("🚀 Kafka prêt, démarrage du serveur...");
    app.listen(3011, () => console.log('✅ timeoff service running on port 3011'));
})();
