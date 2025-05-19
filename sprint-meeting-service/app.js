const express = require('express');
const bodyParser = require('body-parser');
const meetingRoutes = require('./routes/meetingRoutes');
const participantRoutes = require('./routes/participantRoutes');
const {initKafkaRequestResponse} = require('./kafka/producers');
const cors = require('cors');


const app = express();
const port = process.env.PORT ;
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(bodyParser.json());
app.use('/api/sprint-meetings', meetingRoutes);
app.use('/api/participants', participantRoutes);


initKafkaRequestResponse().then(() => {
    app.listen(port, async () => {
        console.log(`✅ meeting service running on port ${port}`);
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});