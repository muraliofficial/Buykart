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
        console.log('Initializing Firebase using Environment Variables');
        serviceAccount = {
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    } 
    // 2. Local: Use credentials.json file
    else if (fs.existsSync(serviceAccountPath)) {
        console.log('Loading credentials from:', serviceAccountPath);
        serviceAccount = require(serviceAccountPath);
    }

    if (serviceAccount) {
        // Validate credentials structure to prevent "16 UNAUTHENTICATED" errors
        // Check for both snake_case (JSON file) and camelCase (Env vars)
        const hasProjectId = serviceAccount.project_id || serviceAccount.projectId;
        const hasPrivateKey = serviceAccount.private_key || serviceAccount.privateKey;
        const hasClientEmail = serviceAccount.client_email || serviceAccount.clientEmail;

        if (!hasProjectId || !hasPrivateKey || !hasClientEmail) {
            throw new Error("Invalid credentials. Check your 'credentials.json' (local) or Environment Variables (Vercel). Ensure you have a 'Service Account Key'.");
        }

        const projectId = serviceAccount.projectId || serviceAccount.project_id;
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully for project:', projectId);
    } else {
        // If no credentials are found, throw a specific error to halt execution.
        throw new Error('Firebase Admin SDK initialization failed: Credentials not found. Ensure FIREBASE_PRIVATE_KEY and other required environment variables are set in your deployment.');
    }
}

const db = admin.firestore();

module.exports = { db, admin };