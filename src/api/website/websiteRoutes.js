const express = require('express');
const router = express.Router();
const controller = require('./websiteController');
const validation = require('./websiteValidation');
const { validate } = require('../middleware/validator');
const { authenticateCustomer } = require('../middleware/authMiddleware');

// Customer Auth OTP routes (unprotected)
router.post('/customer/send-otp', validate([validation.validateSendOtp]), controller.customerSendOtp);
router.post('/send-otp', validate([validation.validateSendOtp]), controller.customerSendOtp);
router.post('/customer/verify-otp', validate([validation.validateVerifyOtp]), controller.customerVerifyOtp);
router.post('/verify-otp', validate([validation.validateVerifyOtp]), controller.customerVerifyOtp);

router.use(authenticateCustomer);

// Products & Inventory storefront routes
router.get('/products', controller.getAllProducts);
router.get('/products/:id', controller.getProductById);
router.get('/inventory', controller.getAllProducts);
router.get('/getInventory', controller.getAllProducts);

// Customer Profile routes with validation
router.post('/customer/profile', validate([validation.validateUpdateProfile]), controller.updateCustomerProfile);
router.get('/customer/profile/:idOrMobile', controller.getCustomerProfile);

// Checkout & Orders routes with validation
router.post('/checkout', validate([validation.validateCheckout]), controller.checkout);
router.get('/orders', controller.getOrders);
router.get('/getOrders', controller.getOrders);

// Contact Us message submission
router.post('/contact', controller.saveContactMessage);

module.exports = router;
