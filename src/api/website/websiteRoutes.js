const express = require('express');
const router = express.Router();
const controller = require('./websiteController');
const validation = require('./websiteValidation');
const { validate } = require('../middleware/validator');
const { authenticateCustomer } = require('../middleware/authMiddleware');

// 1. Customer Auth OTP routes (unprotected)
router.post('/customer/send-otp', validate([validation.validateSendOtp]), controller.customerSendOtp);
router.post('/send-otp', validate([validation.validateSendOtp]), controller.customerSendOtp);
router.post('/customer/verify-otp', validate([validation.validateVerifyOtp]), controller.customerVerifyOtp);
router.post('/verify-otp', validate([validation.validateVerifyOtp]), controller.customerVerifyOtp);

// 2. Public Products & Inventory storefront catalog routes (unprotected)
router.get('/products', controller.getAllProducts);
router.get('/products/:id', controller.getProductById);
router.get('/inventory', controller.getAllProducts);
router.get('/getInventory', controller.getAllProducts);

// 3. Contact Us message submission (unprotected)
router.post('/contact', controller.saveContactMessage);

// 4. Authenticated Customer Scope
router.use(authenticateCustomer);

// Customer Profile routes with validation
router.post('/customer/profile', validate([validation.validateUpdateProfile]), controller.updateCustomerProfile);
router.get('/customer/profile/:idOrMobile', controller.getCustomerProfile);

// Checkout & Orders routes with validation
router.post('/checkout', validate([validation.validateCheckout]), controller.checkout);
router.get('/orders', controller.getOrders);
router.get('/getOrders', controller.getOrders);

module.exports = router;
