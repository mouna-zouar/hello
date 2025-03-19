const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.MEETING_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/meetings': '/api/sprint-meetings',
        },
    })
);

module.exports = router;
