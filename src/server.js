require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./api/routes');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies (for forms)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fix for Vercel/Deployed environments: Serve images from /tmp if deployed
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../public/img/inventory');
app.use('/public/img/inventory', express.static(uploadDir));

// Serve static files (CSS, JS, Images) from the 'public' directory
app.use('/public', express.static(path.join(__dirname, '../public')));

// Use API routes
app.use('/', routes);

// Handle 404 for API endpoints
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// Handle 500 - Internal Server Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Listen on port if started directly in local node environment
if (require.main === module && !isVercel) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;