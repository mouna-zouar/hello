const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.TASK_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/tasks': '/api/tasks',
        },
    })
);

module.exports = router;
