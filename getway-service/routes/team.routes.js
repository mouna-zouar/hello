const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.TEAM_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/teams': '/api/teams',
        },
    })
);

module.exports = router;
