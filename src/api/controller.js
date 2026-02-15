const { db, storage } = require('./firebase');
const path = require('path');

const COLLECTION_NAME = 'products';

exports.createProduct = async (req, res) => {
    try {
        const data = req.body;
        const docRef = await db.collection(COLLECTION_NAME).add({
            ...data,
            createdAt: new Date().toISOString()
        });
        res.status(201).json({ id: docRef.id, message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addInventory = async (req, res) => {
    try {
        const { category, itemName, unit, price, op_stock, description } = req.body;
        
        // Basic validation
        if (!itemName || !unit || !price || !op_stock || !category) {
            return res.status(400).json({ message: 'Please provide itemName, unit, price, and opening stock.' });
        }

        let imageFilename = '';

        if (req.file) {
            // Check if file is already saved to disk (if middleware did it)
            if (req.file.filename) {
                imageFilename = req.file.filename;
            } else if (req.file.buffer) {
                // Upload to Firebase Storage
                const bucket = storage.bucket();
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const extension = path.extname(req.file.originalname);
                const fileName = `inventory/${uniqueSuffix}${extension}`;
                const file = bucket.file(fileName);

                await file.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
                await file.makePublic();
                imageFilename = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            }
        } else {
            return res.status(400).json({ message: 'Image is required' });
        }

        const newInventory = { category, itemName, unit, price, op_stock, description, image: imageFilename, createdAt: new Date().toISOString() };

        await db.collection('inventory').add(newInventory);
        res.status(200).json({ message: 'Inventory added successfully', data: newInventory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const {  category, itemName, unit, price, op_stock, description } = req.body;
        
        let updateData = {
            category,
            itemName,
            unit,
            price,
            op_stock,
            description,
            updatedAt: new Date().toISOString()
        };

        if (req.file) {
            let imageFilename = '';
            if (req.file.filename) {
                imageFilename = req.file.filename;
            } else if (req.file.buffer) {
                const bucket = storage.bucket();
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const extension = path.extname(req.file.originalname);
                const fileName = `inventory/${uniqueSuffix}${extension}`;
                const file = bucket.file(fileName);
                await file.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
                await file.makePublic();
                imageFilename = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            }
            updateData.image = imageFilename;
            
            // Note: You could optionally fetch the old doc here to delete the old image file
        }

        await db.collection('inventory').doc(id).update(updateData);
        res.status(200).json({ message: 'Inventory updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Get document to find image filename
        const doc = await db.collection('inventory').doc(id).get();
        
        if (!doc.exists) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        const data = doc.data();

        // 2. Delete image file from public/img
        if (data.image) {
            // If it's a storage URL, try to delete from bucket
            if (data.image.startsWith('http')) {
                try {
                    const bucket = storage.bucket();
                    // Extract path from URL (simple split for standard storage URLs)
                    const filePath = data.image.split(`${bucket.name}/`)[1];
                    if (filePath) await bucket.file(filePath).delete();
                } catch (e) { console.log("Error deleting file", e.message); }
            }
        }

        // 3. Delete from Database
        await db.collection('inventory').doc(id).delete();
        res.status(200).json({ message: 'Inventory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInventory = async (req, res) => {
    try {
        const snapshot = await db.collection('inventory').orderBy('createdAt', 'desc').get();
        const inventory = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await db.collection(COLLECTION_NAME).doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection(COLLECTION_NAME).doc(id).delete();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Please enter both username and password" });
        }

        // Query Firestore for the user (assuming 'name' is the username field based on your addUser logic)
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('name', '==', username).get();

        if (snapshot.empty) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Check password (Note: In production, use bcrypt to compare hashed passwords)
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        res.status(200).json({ message: 'Login successful', user: { id: userDoc.id, name: userData.name, phone: userData.phone } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { confirmPassword, ...userData } = req.body; // Exclude confirmPassword

        // Check if user already exists
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('name', '==', userData.name).get();

        if (!snapshot.empty) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const docRef = await db.collection('users').add({
            ...userData,
            createdAt: new Date().toISOString()
        });
        res.status(200).json({ message: 'User added successfully', id: docRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};