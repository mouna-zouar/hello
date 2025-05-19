const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const salaryRoutes = require('./routes/salaryRoutes');
const {initKafkaRequestResponse} = require('./kafka/producers');
const cors = require('cors');

const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/salarys', salaryRoutes);


initKafkaRequestResponse().then(() => {
    app.listen(port, async () => {
        console.log(`✅ Salary service running on port ${port}`);
    });
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de Kafka :", err);
});

