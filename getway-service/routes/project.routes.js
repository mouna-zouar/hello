const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.PROJECT_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/projects': '/api/projects',
        },
    })
);

module.exports = router;
