const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../../credentials.json');
let serviceAccount;

// 1. Production: Use environment variables (Vercel)
if (process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
} 
// 2. Local: Use credentials.json file
else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
}

// Validation
if (!serviceAccount) {
    throw new Error('Firebase Admin SDK initialization failed: Credentials not found. Ensure FIREBASE_PRIVATE_KEY is set or credentials.json exists.');
}

module.exports = serviceAccount;