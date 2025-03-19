const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.BACKLOG_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/backlogs': '/api/backlogs',
        },
    })
);

module.exports = router;
