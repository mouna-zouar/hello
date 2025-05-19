const express = require('express');
const bodyParser = require('body-parser');
const { initKafkaRequestResponse } = require('./kafka/producers');
const{startConsumer} = require('./kafka/consumer');
const cors = require('cors');

require('dotenv').config();

const projectRoutes = require('./routes/projectRoutes');
const projectEmployeeRoutes = require('./routes/projectEmployeeRoutes');

const app = express();
const port = process.env.PORT || 3004;
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
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

