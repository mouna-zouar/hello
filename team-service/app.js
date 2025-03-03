const express = require('express');
const bodyParser = require('body-parser');
const teamRoutes = require('./Routes/teamRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3004;
app.use(bodyParser.json());

app.use('/teams', teamRoutes);

app.listen(port, () => {
    console.log(`Team service running on port ${port}`);
});
