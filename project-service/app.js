const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const projectRoutes = require('./routes/projectRoutes');
const projectEmployeeRoutes = require('./routes/projectEmployeeRoutes');

const app = express();
const port = process.env.PORT || 3004;

app.use(bodyParser.json());
app.use('/api/projects', projectRoutes);
app.use('/api/projectEmployee', projectEmployeeRoutes);

app.listen(port, () => {
    console.log(` Project service running on port ${port}`);
});
