const express = require('express');
const bodyParser = require('body-parser');
const taskRoutes = require('./Routes/taskRoutes');
const dependencyRoutes = require('./Routes/dependencyRoutes');
const columnRoutes = require('./Routes/columnRoutes');
const {initKafkaRequestResponse} = require('./kafka/producers');
const {startConsumer} = require('./kafka/consumer');
const cors = require('cors');


const app = express();
const port = 3006;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/dependency',dependencyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/columns', columnRoutes);


initKafkaRequestResponse().then(() => {
    app.listen(port, async () => {
        console.log(`✅ task service running on port ${port}`);
        await startConsumer();
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});