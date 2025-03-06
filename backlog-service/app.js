const express = require('express');
const bodyParser = require('body-parser');
const backlogRoutes = require('./Routes/backlogRoutes');

const app = express();
const port = 3008;

app.use(bodyParser.json());
app.use('/api/backlogs', backlogRoutes);


app.listen(port, () => {
    console.log(`Backlog Serveur démarré sur ${port}`);
});
