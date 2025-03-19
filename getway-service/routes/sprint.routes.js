const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.SPRINT_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/sprints': '/api/sprints',
        },
    })
);

module.exports = router;
