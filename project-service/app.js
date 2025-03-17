const express = require('express');
const bodyParser = require('body-parser');
const { initKafkaRequestResponse } = require('./kafka/producers');  // Assurez-vous de bien importer l'init de Kafka

require('dotenv').config();

const projectRoutes = require('./routes/projectRoutes');
const projectEmployeeRoutes = require('./routes/projectEmployeeRoutes');

const app = express();
const port = process.env.PORT || 3004;

app.use(bodyParser.json());
app.use('/api/projects', projectRoutes);
app.use('/api/projectEmployee', projectEmployeeRoutes);

app.listen(port, async () => {
    await initKafkaRequestResponse(); // Vous vous assurez que Kafka est prêt
    console.log("✅ Kafka connecté avec succès");
    console.log(`🚀 Project service running on port ${port}`);

});
