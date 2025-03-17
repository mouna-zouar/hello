const express = require('express');
const bodyParser = require('body-parser');
const { initKafkaRequestResponse } = require('./kafka/producers');  // Assurez-vous de bien importer l'init de Kafka
const{startConsumer} = require('./kafka/consumer');
require('dotenv').config();

const projectRoutes = require('./routes/projectRoutes');
const projectEmployeeRoutes = require('./routes/projectEmployeeRoutes');

const app = express();
const port = process.env.PORT || 3004;

app.use(bodyParser.json());
app.use('/api/projects', projectRoutes);
app.use('/api/projectEmployee', projectEmployeeRoutes);

initKafkaRequestResponse().then(() => {
    app.listen(port, async () => {
        console.log(`✅ project service running on port ${port}`);
        await startConsumer();
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});

