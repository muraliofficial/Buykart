const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin using the same credentials.json
// Ensure your Google Cloud Project has Firebase enabled and Firestore Database created.

const serviceAccountPath = path.join(__dirname, '../../credentials.json');

// 1. Check for Environment Variable (Render/Vercel Deployment)
if (process.env.FIREBASE_CREDENTIALS) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} 
// 2. Check if running locally with credentials file
else if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} 
// 3. Running in Cloud Functions (Automatic Credentials - Fallback)
else {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
}

const db = admin.firestore();
const storage = admin.storage();

module.exports = { db, admin, storage };