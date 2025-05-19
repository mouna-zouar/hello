const express = require('express');
const bodyParser = require('body-parser');
const employeeRoutes = require('./routes/employeeRoutes');
const { initKafkaRequestResponse } = require('./kafka/producer');
const {startConsumer} = require('./kafka/consumer');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;
const cors = require('cors');

app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/employees', employeeRoutes);


initKafkaRequestResponse().then(() => {
    app.listen(port, async () => {
        console.log(`✅ Employee service running on port ${port}`);
        await startConsumer();
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});
