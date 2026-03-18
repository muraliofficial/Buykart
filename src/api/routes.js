const express = require('express');
const path = require('path');
const router = express.Router();
const apiRoutes = require('./index');

// Mount API routes (Login, Products, Inventory)
router.use('/', apiRoutes);

// Helper to reliably find views folder in both Local and Vercel environments
const viewsDir = path.join(process.cwd(), 'views');

// Serve the login page for the root route
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsDir, 'admin/login.html'));
});
router.get('/user', (req, res) => {
    res.sendFile(path.join(viewsDir, 'admin/user.html'));
});

// Serve the main HTML file for the home route
router.get('/home', (req, res) => {
    res.sendFile(path.join(viewsDir, 'layout/index.html'));
});

// Serve the admin page
router.get('/admin', (req, res) => {
    res.sendFile(path.join(viewsDir, 'admin/admin.html'));
});

// Serve the admin page
router.get('/inventory', (req, res) => {
    res.sendFile(path.join(viewsDir, 'admin/inventory.html'));
});

// Serve the Website page
router.get('/buykart', (req, res) => {
    res.sendFile(path.join(viewsDir, 'website/buykart.html'));
});
router.get('/about', (req, res) => {
    res.sendFile(path.join(viewsDir, 'website/about.html'));
});
router.get('/contact', (req, res) => {
    res.sendFile(path.join(viewsDir, 'website/contact.html'));
});
router.get('/cart', (req, res) => {
    res.sendFile(path.join(viewsDir, 'website/cart.html'));
});

// Serve the navigation component
router.get('/admin/nav', (req, res) => {
    res.sendFile(path.join(viewsDir, 'admin/nav.html'));
});

// Serve the website navigation component
router.get('/buykart/nav', (req, res) => {
    res.sendFile(path.join(viewsDir, 'website/nav_buykart.html'));
});

module.exports = router;