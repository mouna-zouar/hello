const express = require('express');
const bodyParser = require('body-parser');
const employeeRoutes = require('./routes/employeeRoutes');
const { initKafkaRequestResponse } = require('./kafka/requestResponse');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use('/employees', employeeRoutes);

initKafkaRequestResponse().then(() => {
    app.listen(port, () => {
        console.log(`✅ Employee service running on port ${port}`);
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});
