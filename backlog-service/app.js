const express = require('express');
const bodyParser = require('body-parser');
const backlogRoutes = require('./Routes/backlogRoutes');
const { initKafkaRequestResponse } = require('./kafka/producers');
const { startConsumer } = require('./kafka/consumer');
const cors = require('cors');
const app = express();
const port = 3008;
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true,
}));
app.use(bodyParser.json());
app.use('/api/backlogs', backlogRoutes);


initKafkaRequestResponse().then(() => {
    app.listen(port, async () => {
        console.log(`✅ backlog service running on port ${port}`);
        await startConsumer();
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});
