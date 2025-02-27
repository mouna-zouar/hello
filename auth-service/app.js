const express = require('express');
const helmet = require("helmet");
const app = express();
const bodyParser = require('body-parser');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
app.use(helmet());
app.use(bodyParser.json());

app.use('/api/roles', roleRoutes);
app.use("/api/users", userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/permissions', permissionRoutes);



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
