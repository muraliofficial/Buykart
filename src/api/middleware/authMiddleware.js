const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'buykart_production_secret_key_2026';

// Helper to sign JWT tokens
const generateToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Helper to check if request path is a public login or OTP route
const isPublicAuthRoute = (req) => {
    const path = (req.path || '').toLowerCase();
    const originalUrl = (req.originalUrl || '').toLowerCase();
    return (
        path.includes('/login') ||
        path.includes('/verify-otp') ||
        path.includes('/send-otp') ||
        path.includes('/adduser') ||
        originalUrl.includes('/login') ||
        originalUrl.includes('/verify-otp') ||
        originalUrl.includes('/send-otp') ||
        originalUrl.includes('/adduser')
    );
};

// Middleware to authenticate Admin staff requests
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers['x-access-token'];
    
    if (isPublicAuthRoute(req)) {
        return next();
    }

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authentication required. Authorization header missing.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired admin session token' });
    }
};

// Middleware to authenticate Rider requests
const authenticateRider = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers['x-access-token'];
    
    if (isPublicAuthRoute(req)) {
        return next();
    }

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Rider authentication required. Authorization header missing.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.rider = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired rider session token' });
    }
};

// Middleware to authenticate Customer requests
const authenticateCustomer = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers['x-access-token'];
    
    if (isPublicAuthRoute(req)) {
        return next();
    }

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Customer authentication required. Authorization header missing.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.customer = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired customer session token' });
    }
};

module.exports = {
    JWT_SECRET,
    generateToken,
    authenticateAdmin,
    authenticateRider,
    authenticateCustomer
};
