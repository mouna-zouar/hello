const express = require('express');
const bodyParser = require('body-parser');
const timeOffRoutes = require('./Routes/timeOffRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());

app.use('/api/timeoffs', timeOffRoutes);

app.listen(port, () => {
    console.log(`Timeoff service running on port ${port}`);
});
