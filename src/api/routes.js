const express = require('express');
const path = require('path');
const router = express.Router();
const apiRoutes = require('./index');

// Mount API routes (Login, Products, Inventory)
router.use('/', apiRoutes);

// Serve the login page for the root route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/admin/login.html'));
});
router.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/admin/user.html'));
});

// Serve the main HTML file for the home route
router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/layout/index.html'));
});

// Serve the admin page
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/admin/admin.html'));
});

// Serve the admin page
router.get('/inventory', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/admin/inventory.html'));
});

// Serve the Website page
router.get('/buykart', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/website/buykart.html'));
});

// Serve the navigation component
router.get('/admin/nav', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/admin/nav.html'));
});

// Serve the website navigation component
router.get('/buykart/nav', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/website/nav_buykart.html'));
});

module.exports = router;