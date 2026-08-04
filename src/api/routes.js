const express = require('express');
const router = express.Router();
const apiRoutes = require('./index');

// Mount API routes (Login, Products, Inventory, Orders, Checkout, Users)
router.use('/', apiRoutes);

module.exports = router;