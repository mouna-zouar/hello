const express = require('express');
const bodyParser = require('body-parser');
const employeeRoutes = require('./routes/employeeRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use('/employees', employeeRoutes);

app.listen(port, () => {
    console.log(` Employee service running on port ${port}`);
});
