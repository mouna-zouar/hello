const express = require('express');
const bodyParser = require('body-parser');
const taskRoutes = require('./Routes/taskRoutes');

const app = express();
const port = 3006;

app.use(bodyParser.json());

app.use('/api/tasks', taskRoutes);

app.listen(port, () => {
    console.log(`Task Serveur démarré sur ${port}`);
});
