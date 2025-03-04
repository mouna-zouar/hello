const express = require('express');
const sprintRoutes = require('./routes/sprintRoutes');

const app = express();
app.use(express.json());

app.use('/api/sprints', sprintRoutes);

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log(`Sprint service running on port ${PORT}`));
