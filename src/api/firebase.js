const admin = require('firebase-admin');
const serviceAccount = require('./config');

let db;

try {
    if (!admin.apps.length && serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully.');
    }
    
    if (admin.apps.length) {
        db = admin.firestore();
    }
} catch (error) {
    console.error('⚠️ Firebase Admin Initialization Error:', error.message);
}

// Fallback Firestore wrapper to prevent function crashes if credentials are missing
if (!db) {
    console.warn('⚠️ Operating with Firestore fallback instance to prevent server crash.');
    const dummyCollection = () => ({
        get: async () => ({ docs: [], empty: true }),
        doc: () => ({
            get: async () => ({ exists: false, data: () => ({}) }),
            set: async () => {},
            update: async () => {},
            delete: async () => {},
        }),
        add: async () => ({ id: 'fallback-id' }),
        orderBy: () => dummyCollection(),
        where: () => dummyCollection(),
    });

    db = {
        collection: dummyCollection,
    };
}

module.exports = { db, admin };