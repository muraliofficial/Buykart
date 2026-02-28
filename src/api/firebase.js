const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin using the same credentials.json
// Ensure your Google Cloud Project has Firebase enabled and Firestore Database created.
// This logic supports Vercel deployments (via env vars) and local development (via credentials.json).

if (!admin.apps.length) {
    const serviceAccountPath = path.join(__dirname, '../../credentials.json');
    let serviceAccount;

    // 1. Production: Use environment variables (Vercel)
    if (process.env.FIREBASE_PRIVATE_KEY) {
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    } 
    // 2. Local: Use credentials.json file
    else if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
    }

    if (serviceAccount) {
        const projectId = serviceAccount.projectId || serviceAccount.project_id;
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
        });
    } else {
        // If no credentials are found, throw a specific error to halt execution.
        throw new Error('Firebase Admin SDK initialization failed: Credentials not found. Ensure FIREBASE_PRIVATE_KEY and other required environment variables are set in your deployment.');
    }
}

const db = admin.firestore();
const storage = admin.storage();

module.exports = { db, admin, storage };