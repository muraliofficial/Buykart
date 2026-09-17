// Buykart Server - API Services
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./api/routes');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for frontend clients
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON and URL-encoded bodies with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Fix for Vercel/Deployed environments: Serve images from /tmp if deployed
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../public/img/inventory');
app.use('/public/img/inventory', express.static(uploadDir));

// Fix for Vercel/Deployed environments: URL path resolution for serverless functions
app.use((req, res, next) => {
    // Vercel populates x-matched-path or x-invoke-path with original requested path
    const realPath = req.headers['x-matched-path'] || req.headers['x-invoke-path'] || req.headers['x-forwarded-uri'];
    if (realPath && realPath !== '/api/index.js' && realPath !== '/api/index') {
        req.url = realPath;
    }
    next();
});

const fs = require('fs');
const distPath = path.join(__dirname, '../dist');
const distIndex = path.join(distPath, 'index.html');

// Serve static compiled SPA files from 'dist' if available
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// Serve static files (CSS, JS, Images) from the 'public' directory
app.use('/public', express.static(path.join(__dirname, '../public')));

// Fallback for HTML page requests to support SPA client routing if serverless function handles the route
app.use((req, res, next) => {
    if (req.method === 'GET' && req.headers.accept && req.headers.accept.includes('text/html')) {
        const isApiExplicit = req.path.startsWith('/api/');
        if (!isApiExplicit && fs.existsSync(distIndex)) {
            return res.sendFile(distIndex);
        }
    }
    next();
});

// Health check and root route (must be before route handlers)
app.get('/', (req, res) => {
    if (req.headers.accept && req.headers.accept.includes('text/html') && fs.existsSync(distIndex)) {
        return res.sendFile(distIndex);
    }
    res.json({ status: "ok", message: "Buykart Backend API is running successfully!" });
});
app.get('/health', (req, res) => {
    res.json({ status: "ok" });
});
app.get('/api/health', (req, res) => {
    res.json({ status: "ok" });
});

// Use API routes (support both '/api' and legacy root '/' prefixes, prioritizing '/api')
app.use('/api', routes);
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