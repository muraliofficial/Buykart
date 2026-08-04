require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./api/routes');
const app = express();
const port = 3000;

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

// Serve built React app from 'dist'
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to React index.html for client-side routing
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).sendFile(path.join(__dirname, '../404.html'));
    }
});

// Handle 500 - Internal Server Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, '../500.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;