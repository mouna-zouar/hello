const express = require('express');
const bodyParser = require('body-parser');
const meetingRoutes = require('./routes/meetingRoutes');
const participantRoutes = require('./routes/participantRoutes');
const app = express();
const port = process.env.PORT ;

app.use(bodyParser.json());
app.use('/api/sprint-meetings', meetingRoutes);
app.use('/api/participants', participantRoutes);


app.listen(port, () => {
    console.log(` meeting service running on port ${port}`);
});
