const express = require('express');
const router = express.Router();

const websiteRoutes = require('./website/websiteRoutes');
const adminRoutes = require('./admin/adminRoutes');
const ontimeRoutes = require('./ontime/ontimeRoutes');

// 1. App-wise Prefixed API Endpoints
router.use('/website', websiteRoutes);
router.use('/admin', adminRoutes);
router.use('/ontime', ontimeRoutes);

// 2. Fallback Root Mounting for backward compatibility
router.use('/', websiteRoutes);

module.exports = router;