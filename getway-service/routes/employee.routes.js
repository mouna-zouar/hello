const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();
/////
router.use(
    '/',
    createProxyMiddleware({
        target: process.env.EMPLOYEE_SERVICE,
        changeOrigin: true,
        pathRewrite: {
            '^/employees': '/employees',
        },
    })
);

module.exports = router;
