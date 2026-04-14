const { db } = require('./firebase');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const SALT_ROUNDS = 10;
const COLLECTION_NAME = 'products';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to upload memory buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const writeStream = cloudinary.uploader.upload_stream(
            { folder: 'buykart_inventory' },
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
        const readStream = new Readable({
            read() {
                this.push(buffer);
                this.push(null);
            }
        });
        readStream.pipe(writeStream);
    });
};

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
            return res.status(400).json({ message: 'Please provide category, itemName, unit, price, and opening stock.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Upload file from memory to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer);

        // We store the public ID so we can delete the image later if needed
        const newInventory = { category, itemName, unit, price, op_stock, description, image: result.secure_url, imageId: result.public_id, createdAt: new Date().toISOString() };

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
        
        const updateData = { category, itemName, unit, price, op_stock, description };

        // Remove undefined properties so they don't overwrite existing fields in Firestore
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        updateData.updatedAt = new Date().toISOString();
        
        if (req.file) {
            // Upload new image to Cloudinary
            const result = await uploadToCloudinary(req.file.buffer);
            updateData.image = result.secure_url;
            updateData.imageId = result.public_id;
            
            // Fetch the old document to get the old image path for deletion.
            const docRef = db.collection('inventory').doc(id);
            const doc = await docRef.get();
            if (doc.exists && doc.data().image) {
                const oldImage = doc.data().image;
                const oldImageId = doc.data().imageId;
                
                if (oldImageId) {
                    try {
                        await cloudinary.uploader.destroy(oldImageId);
                    } catch (e) {
                        console.error("Error deleting old Cloudinary image:", e.message);
                    }
                } else if (!oldImage.startsWith('http')) {
                    // Fallback for deleting local files during local dev
                    const cleanName = oldImage.replace(/^inventory[\\/]/, '');
                    const uploadDir = process.env.VERCEL === '1' ? '/tmp' : path.join(__dirname, '../../public/img/inventory');
                    const oldImagePath = path.join(uploadDir, cleanName);
                    try {
                        await fs.unlink(oldImagePath);
                    } catch (e) {
                        console.error("Error deleting old local image:", e.message);
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
            if (data.imageId) {
                try {
                    await cloudinary.uploader.destroy(data.imageId);
                } catch (e) {
                    console.log("Error deleting Cloudinary image:", e.message);
                }
            } else if (!data.image.startsWith('http')) {
                try {
                    const cleanName = data.image.replace(/^inventory[\\/]/, '');
                    const uploadDir = process.env.VERCEL === '1' ? '/tmp' : path.join(__dirname, '../../public/img/inventory');
                    const imagePath = path.join(uploadDir, cleanName);
                    await fs.unlink(imagePath);
                } catch (e) {
                    console.log("Error deleting local image file, it might not exist:", e.message);
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
        const updateData = { ...data };

        // Remove undefined properties to support partial updates
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        updateData.updatedAt = new Date().toISOString();
        await db.collection(COLLECTION_NAME).doc(id).update(updateData);
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

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Securely compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
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

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

        const docRef = await db.collection('users').add({
            ...userData,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        });
        res.status(200).json({ message: 'User added successfully', id: docRef.id });
    } catch (error) {
        console.error('Add User Error:', error);
        res.status(500).json({ message: error.message });
    }
};