const express = require('express');
const bodyParser = require('body-parser');
const taskRoutes = require('./Routes/taskRoutes');
const dependencyRoutes = require('./Routes/dependencyRoutes');
const {initKafkaRequestResponse} = require('./kafka/producers');
const {startConsumer} = require('./kafka/consumer');

const app = express();
const port = 3006;

app.use(bodyParser.json());
app.use('/api',dependencyRoutes);
app.use('/api/tasks', taskRoutes);

initKafkaRequestResponse().then(() => {
    app.listen(port, async () => {
        console.log(`✅ task service running on port ${port}`);
        await startConsumer();
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});