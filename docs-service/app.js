const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { setupSocket } = require('./socket/typing'); 

const app = express();
const port = 3015;

const messageRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const pageRoutes = require('./routes/pageRoutes');

// CORS & Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(bodyParser.json());

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/notif', notificationRoutes);
app.use('/api/pages', pageRoutes);

const httpServer = http.createServer(app);

setupSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`✅ Docs service running on port ${port}`);
});
