const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin using the same credentials.json
// Ensure your Google Cloud Project has Firebase enabled and Firestore Database created.
const serviceAccountPath = path.join(__dirname, '../../credentials.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`\n[CRITICAL ERROR] credentials.json not found at: ${serviceAccountPath}`);
    console.error("Please place your Firebase service account key in the project root and rename it to 'credentials.json'.\n");
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

module.exports = { db, admin };