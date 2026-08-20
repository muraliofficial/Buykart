const { db } = require('../firebase');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { generateToken } = require('../middleware/authMiddleware');

const SALT_ROUNDS = 10;
const COLLECTION_INVENTORY = 'inventory';
const COLLECTION_USERS = 'users';
const COLLECTION_ORDERS = 'orders';
const COLLECTION_RIDERS = 'riders';
const COLLECTION_PURCHASES = 'purchases';

// Helper to restock items into inventory when order is cancelled or failed
const restockOrderItems = async (orderData) => {
    if (!orderData || !orderData.items) return;
    const itemsList = Object.values(orderData.items);
    for (const item of itemsList) {
        if (item.id && item.quantity) {
            const itemRef = db.collection(COLLECTION_INVENTORY).doc(item.id);
            const itemDoc = await itemRef.get();
            if (itemDoc.exists) {
                const currentStock = Number(itemDoc.data().op_stock || 0);
                await itemRef.update({ op_stock: currentStock + Number(item.quantity) });
            }
        }
    }
};

// --- INVENTORY MANAGEMENT controllers ---
exports.addInventory = async (req, res) => {
    try {
        const { category, itemName, unit, price, op_stock, description } = req.body;
        
        let imageUrl = '';
        let imageId = '';

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
            imageId = result.public_id;
        } else {
            imageUrl = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80';
        }

        const newInventory = {
            category,
            itemName,
            unit,
            price: Number(price),
            op_stock: Number(op_stock),
            description: description || '',
            image: imageUrl,
            imageId: imageId,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection(COLLECTION_INVENTORY).add(newInventory);
        res.status(200).json({ success: true, message: 'Inventory item added successfully', id: docRef.id, data: newInventory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, itemName, unit, price, op_stock, description } = req.body;
        const updateData = { category, itemName, unit, description };

        if (price !== undefined) updateData.price = Number(price);
        if (op_stock !== undefined) updateData.op_stock = Number(op_stock);

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        updateData.updatedAt = new Date().toISOString();
        
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            updateData.image = result.secure_url;
            updateData.imageId = result.public_id;
        }

        await db.collection(COLLECTION_INVENTORY).doc(id).update(updateData);
        res.status(200).json({ success: true, message: 'Inventory item updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection(COLLECTION_INVENTORY).doc(id).delete();
        res.status(200).json({ success: true, message: 'Inventory item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInventory = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION_INVENTORY).orderBy('createdAt', 'desc').get();
        const inventory = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ORDER FULFILLMENT & STATUS CONTROLLERS ---
exports.getOrders = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION_ORDERS).orderBy('createdAt', 'desc').get();
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, failureReason, packingRemarks, packedItems } = req.body;
        
        const orderRef = db.collection(COLLECTION_ORDERS).doc(id);
        const orderDoc = await orderRef.get();
        
        if (orderDoc.exists) {
            const previousStatus = orderDoc.data().status;
            const isTargetCancelOrFailed = status === 'Cancelled' || status === 'Delivery Failed';
            const wasAlreadyRestocked = previousStatus === 'Cancelled' || previousStatus === 'Delivery Failed';

            if (isTargetCancelOrFailed && !wasAlreadyRestocked) {
                await restockOrderItems(orderDoc.data());
            }
        }

        const updateObj = {
            status,
            updatedAt: new Date().toISOString()
        };
        if (failureReason !== undefined) updateObj.failureReason = failureReason;
        if (packingRemarks !== undefined) updateObj.packingRemarks = packingRemarks;
        if (packedItems !== undefined) updateObj.packedItems = packedItems;

        await orderRef.update(updateObj);
        res.status(200).json({ success: true, message: "Order status updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.packOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { packedItems, packingRemarks } = req.body;
        
        await db.collection(COLLECTION_ORDERS).doc(id).update({
            status: "Packed",
            packedItems: packedItems || [],
            packingRemarks: packingRemarks || '',
            packedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        res.status(200).json({ success: true, message: "Order marked as Packed successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.dispatchOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { riderId, riderName, riderMobile, vehicleDetails, dispatchTime } = req.body;

        await db.collection(COLLECTION_ORDERS).doc(id).update({
            status: "Dispatched",
            assignedRiderId: riderId,
            assignedRiderName: riderName || '',
            assignedRiderMobile: riderMobile || '',
            vehicleDetails: vehicleDetails || '',
            dispatchTime: dispatchTime || new Date().toLocaleTimeString(),
            dispatchedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({ success: true, message: "Order dispatched and Rider assigned successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- RIDER MASTER ADMIN CONTROLLERS ---
exports.getRiders = async (req, res) => {
    try {
        const snap = await db.collection(COLLECTION_RIDERS).get();
        const riders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(riders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addRider = async (req, res) => {
    try {
        const { name, mobile, bikeNumber, rcNumber, licenseNumber, status } = req.body;
        
        const snap = await db.collection(COLLECTION_RIDERS).where('mobile', '==', mobile).get();
        if (!snap.empty) {
            return res.status(400).json({ success: false, message: "A rider with this mobile number already exists" });
        }

        const newRider = {
            name: name.trim(),
            mobile: String(mobile).trim(),
            bikeNumber: bikeNumber || '',
            rcNumber: rcNumber || '',
            licenseNumber: licenseNumber || '',
            status: status || 'Active',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection(COLLECTION_RIDERS).add(newRider);
        res.status(201).json({ success: true, message: "Rider account created successfully", rider: { id: docRef.id, ...newRider } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRider = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        data.updatedAt = new Date().toISOString();

        await db.collection(COLLECTION_RIDERS).doc(id).update(data);
        res.status(200).json({ success: true, message: "Rider details updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- STOCK INWARD / PURCHASE ENTRY CONTROLLERS ---
exports.createPurchaseEntry = async (req, res) => {
    try {
        const { vendorName, invoiceNo, date, productId, productName, purchaseRate, quantity, totalCost, remarks } = req.body;
        
        const purchaseRecord = {
            vendorName: vendorName.trim(),
            invoiceNo: invoiceNo || `INV-${Date.now()}`,
            date: date || new Date().toISOString().split('T')[0],
            productId,
            productName: productName || 'Product',
            purchaseRate: Number(purchaseRate || 0),
            quantity: Number(quantity || 0),
            totalCost: Number(totalCost || (Number(purchaseRate || 0) * Number(quantity || 0))),
            remarks: remarks || '',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection(COLLECTION_PURCHASES).add(purchaseRecord);

        // Update product opening stock (op_stock) in inventory collection
        const itemRef = db.collection(COLLECTION_INVENTORY).doc(productId);
        const itemDoc = await itemRef.get();
        if (itemDoc.exists) {
            const currentStock = Number(itemDoc.data().op_stock || 0);
            const updatedStock = currentStock + Number(quantity);
            await itemRef.update({ op_stock: updatedStock });
        }

        res.status(201).json({ success: true, message: "Stock Inward Purchase recorded & inventory stock updated!", id: docRef.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPurchases = async (req, res) => {
    try {
        const snap = await db.collection(COLLECTION_PURCHASES).orderBy('createdAt', 'desc').get();
        const purchases = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ADMIN STAFF LOGIN & USER MANAGEMENT CONTROLLERS ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const usersRef = db.collection(COLLECTION_USERS);
        const snapshot = await usersRef.where('name', '==', username).get();

        if (snapshot.empty) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (!userData.password) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const role = userData.role || 'admin';
        const token = generateToken({ id: userDoc.id, name: userData.name, role });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: userDoc.id, name: userData.name, phone: userData.phone, role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { confirmPassword, ...userData } = req.body;
        const usersRef = db.collection(COLLECTION_USERS);
        const snapshot = await usersRef.where('name', '==', userData.name).get();

        if (!snapshot.empty) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
        const docRef = await db.collection(COLLECTION_USERS).add({
            ...userData,
            role: userData.role || 'admin',
            password: hashedPassword,
            createdAt: new Date().toISOString()
        });
        res.status(200).json({ success: true, message: 'User added successfully', id: docRef.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION_USERS).orderBy('createdAt', 'desc').get();
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            phone: doc.data().phone,
            role: doc.data().role || 'admin',
            createdAt: doc.data().createdAt
        }));
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
