const express = require('express');
const sprintRoutes = require('./routes/sprintRoutes');
const {initKafkaRequestResponse} = require('./kafka/producers');
const {startConsumer} = require('./kafka/consumer');


const app = express();
app.use(express.json());

app.use('/api/sprints', sprintRoutes);


const PORT = process.env.PORT || 3007;
initKafkaRequestResponse().then(() => {
    app.listen(PORT, async () => {
        console.log(`✅ sprint service running on port ${PORT}`);
        await startConsumer();
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});