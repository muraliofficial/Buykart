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

// Fallback Firestore wrapper to store and query data in-memory when credentials are missing
if (!db) {
    console.warn('⚠️ Operating with in-memory Firestore fallback store.');
    const memoryStore = new Map();

    const getCollectionStore = (collName) => {
        if (!memoryStore.has(collName)) {
            memoryStore.set(collName, new Map());
        }
        return memoryStore.get(collName);
    };

    const createCollectionRef = (collName, filters = [], sortField = null, sortDir = 'desc') => {
        return {
            get: async () => {
                const store = getCollectionStore(collName);
                let items = Array.from(store.entries()).map(([id, data]) => ({
                    id,
                    data: () => data,
                    ...data
                }));

                // Apply filters
                for (const filter of filters) {
                    items = items.filter(item => {
                        const val = item[filter.field];
                        if (filter.op === '==') return val === filter.val;
                        if (filter.op === '!=') return val !== filter.val;
                        return true;
                    });
                }

                // Apply sorting
                if (sortField) {
                    items.sort((a, b) => {
                        const valA = a[sortField] || '';
                        const valB = b[sortField] || '';
                        if (sortDir === 'desc') {
                            return valA > valB ? -1 : valA < valB ? 1 : 0;
                        }
                        return valA < valB ? -1 : valA > valB ? 1 : 0;
                    });
                }

                const docs = items.map(item => ({
                    id: item.id,
                    exists: true,
                    data: () => item.data()
                }));

                return {
                    docs,
                    empty: docs.length === 0,
                    size: docs.length
                };
            },
            doc: (docId) => {
                const targetId = docId || 'doc_' + Math.random().toString(36).substr(2, 9);
                return {
                    id: targetId,
                    get: async () => {
                        const store = getCollectionStore(collName);
                        const data = store.get(targetId);
                        return {
                            id: targetId,
                            exists: !!data,
                            data: () => data || {}
                        };
                    },
                    set: async (data, options) => {
                        const store = getCollectionStore(collName);
                        if (options && options.merge) {
                            const existing = store.get(targetId) || {};
                            store.set(targetId, { ...existing, ...data });
                        } else {
                            store.set(targetId, { ...data });
                        }
                    },
                    update: async (data) => {
                        const store = getCollectionStore(collName);
                        const existing = store.get(targetId) || {};
                        store.set(targetId, { ...existing, ...data });
                    },
                    delete: async () => {
                        const store = getCollectionStore(collName);
                        store.delete(targetId);
                    }
                };
            },
            add: async (data) => {
                const store = getCollectionStore(collName);
                const newId = 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                store.set(newId, { id: newId, ...data });
                return { id: newId };
            },
            orderBy: (field, direction = 'desc') => {
                return createCollectionRef(collName, filters, field, direction);
            },
            where: (field, op, val) => {
                return createCollectionRef(collName, [...filters, { field, op, val }], sortField, sortDir);
            }
        };
    };

    db = {
        collection: (collName) => createCollectionRef(collName),
        runTransaction: async (updateFunction) => {
            const transaction = {
                get: async (docRef) => docRef.get(),
                update: (docRef, data) => docRef.update(data),
                set: (docRef, data, options) => docRef.set(data, options),
                delete: (docRef) => docRef.delete()
            };
            return await updateFunction(transaction);
        }
    };
}

module.exports = { db, admin };