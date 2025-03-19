const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.TIMEOFF_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/timeoffs': '/api/timeoffs',
        },
    })
);

module.exports = router;
