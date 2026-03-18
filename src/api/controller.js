const { db } = require('./firebase');
const path = require('path');
const fs = require('fs').promises;

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
        res.status(500).json({ message: error.message });
    }
};

exports.addInventory = async (req, res) => {
    try {
        const { category, itemName, unit, price, op_stock, description } = req.body;
        
        // Basic validation
        if (!itemName || !unit || !price || !op_stock || !category) {
            return res.status(400).json({ message: 'Please provide itemName, unit, price, and opening stock.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // With multer.diskStorage, file is saved locally. We store the relative path.
        const imageFilename = `inventory/${req.file.filename}`;

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
            // A new file is uploaded, update the image field and delete the old one.
            updateData.image = `inventory/${req.file.filename}`;
            
            // Fetch the old document to get the old image path for deletion.
            const docRef = db.collection('inventory').doc(id);
            const doc = await docRef.get();
            if (doc.exists && doc.data().image) {
                const oldImage = doc.data().image;
                // Avoid trying to delete Firebase Storage URLs from the local filesystem
                if (!oldImage.startsWith('http')) {
                    const oldImagePath = path.join(__dirname, '../../public/img', oldImage);
                    try {
                        await fs.unlink(oldImagePath);
                    } catch (e) {
                        console.error("Error deleting old image file:", e.message);
                    }
                }
            }
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

        // 2. Delete image file from Storage
        if (data.image) {
            // If it's a local file path (not a URL), delete it from the server.
            if (!data.image.startsWith('http')) {
                try {
                    const imagePath = path.join(__dirname, '../../public/img', data.image);
                    await fs.unlink(imagePath);
                } catch (e) {
                    // Log error but don't block DB deletion if file is already gone.
                    console.log("Error deleting image file, it might not exist:", e.message);
                }
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
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection(COLLECTION_NAME).doc(id).delete();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('Login Request Body:', req.body);
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
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.addUser = async (req, res) => {
    try {
        console.log('Add User Request Body:', req.body);
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
        console.error('Add User Error:', error);
        res.status(500).json({ message: error.message });
    }
};