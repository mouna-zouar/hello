const express = require('express');
const helmet = require("helmet");
const cors = require('cors');
const bodyParser = require('body-parser');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const rolePermissionRoutes = require('./routes/rPermissionRoutes');
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
}));
app.use(helmet());
app.use(bodyParser.json());

app.use('/api/roles', roleRoutes);
app.use("/api/users", userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
