const express = require('express');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/authMiddleware');

require('dotenv').config();

const app = express();
app.use(authMiddleware);

const port = process.env.PORT || 3003;

app.use('/', createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/api/users',
    },
}));

app.use('/', createProxyMiddleware({
    target: process.env.EMPLOYEE_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/employees': '/api/employees',
    },
}));

app.all('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
});
