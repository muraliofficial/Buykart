const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../../credentials.json');
let serviceAccount = null;

try {
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
} catch (err) {
    console.warn("⚠️ Firebase service account load error:", err.message);
}

if (!serviceAccount) {
    console.warn('⚠️ Firebase Admin SDK Warning: Credentials not found. Ensure FIREBASE_PRIVATE_KEY is set in environment variables or credentials.json exists.');
}

module.exports = serviceAccount;