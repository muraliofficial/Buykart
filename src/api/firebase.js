const admin = require('firebase-admin');
const serviceAccount = require('./config');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized.');
}

const db = admin.firestore();

// Export services
module.exports = { db, admin };