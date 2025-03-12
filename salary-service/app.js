const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const salaryRoutes = require('./routes/salaryRoutes');

const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
app.use('/api/salarys', salaryRoutes);

app.listen(port, () => {
    console.log(` Salary service running on port ${port}`);
});
