const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin using the same credentials.json
// Ensure your Google Cloud Project has Firebase enabled and Firestore Database created.

const serviceAccountPath = path.join(__dirname, '../../credentials.json');

if (!admin.apps.length) {
    let credential;
    let storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    // 1. Check for Individual Environment Variables (Best for Vercel)
    if (process.env.FIREBASE_PRIVATE_KEY) {
        credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Vercel env vars often escape newlines as "\\n", so we replace them back to real newlines
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        });
        // Auto-configure bucket if not explicitly set
        if (!storageBucket && process.env.FIREBASE_PROJECT_ID) {
            storageBucket = `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
        }
    }
    // 2. Check for JSON Environment Variable (Legacy/Alternative)
    else if (process.env.FIREBASE_CREDENTIALS) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        credential = admin.credential.cert(serviceAccount);
        if (!storageBucket && serviceAccount.project_id) {
            storageBucket = `${serviceAccount.project_id}.appspot.com`;
        }
    }
    // 3. Check if running locally with credentials file
    else if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        credential = admin.credential.cert(serviceAccount);
        if (!storageBucket && serviceAccount.project_id) {
            storageBucket = `${serviceAccount.project_id}.appspot.com`;
        }
    }
    // 4. Fallback (Cloud Functions / ADC)
    else {
        credential = admin.credential.applicationDefault();
    }

    admin.initializeApp({
        credential,
        storageBucket
    });
}

const db = admin.firestore();
const storage = admin.storage();

module.exports = { db, admin, storage };