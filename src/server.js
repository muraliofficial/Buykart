const express = require('express');
const path = require('path');
const routes = require('./api/routes');
const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded bodies (for forms)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, Images) from the 'public' directory
app.use('/public', express.static(path.join(__dirname, '../public')));

// Use API routes
app.use('/', routes);

// Handle 404 - Page Not Found
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '../404.html'));
    } else {
        res.status(404).json({ message: "Endpoint not found" });
    }
});

// Handle 500 - Internal Server Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, '../500.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Mobile IP: ${getMobileIP()}:${port}`);
});

function getMobileIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const ifaceName in interfaces) {
        const iface = interfaces[ifaceName];
        for (const ifaceInfo of iface) {
            if (ifaceInfo.family === 'IPv4' && ifaceInfo.address.startsWith('192.168.')) {
                return ifaceInfo.address;
            }
        }
    }
    return 'Mobile IP not found';
}

module.exports = app;