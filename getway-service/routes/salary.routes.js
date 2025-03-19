const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.SALARY_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/salaries': '/api/salarys',
        },
    })
);

module.exports = router;
