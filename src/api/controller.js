const { db } = require('./firebase');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;

const SALT_ROUNDS = 10;
const COLLECTION_NAME = 'products';

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("⚠️ Warning: Cloudinary environment variables are missing! Uploads will fail.");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to upload memory buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'buykart_inventory' },
            (err, result) => {
                if (err) {
                    console.error("Cloudinary upload error:", err);
                    return reject(err);
                }
                resolve(result);
            }
        ).end(buffer);
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
                let oldImageId = doc.data().imageId;
                
                if (!oldImageId && oldImage.includes('cloudinary.com')) {
                    const match = oldImage.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
                    if (match) oldImageId = match[1];
                }
                
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
            let publicId = data.imageId;
            
            // Fallback for older items that might not have imageId saved but have a cloudinary URL
            if (!publicId && data.image.includes('cloudinary.com')) {
                const match = data.image.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
                if (match) publicId = match[1];
            }

            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
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

        // Fallback in case an older database entry doesn't have a password field
        if (!userData.password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Securely compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const role = userData.role || (userData.name && userData.name.toLowerCase() === 'admin' ? 'admin' : 'customer');
        res.status(200).json({
            message: 'Login successful',
            user: { id: userDoc.id, name: userData.name, phone: userData.phone, role }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { confirmPassword, ...userData } = req.body; // Exclude confirmPassword

        if (!userData.name || !userData.password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if user already exists
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('name', '==', userData.name).get();

        if (!snapshot.empty) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

        const role = userData.role || (userData.name.toLowerCase() === 'admin' ? 'admin' : 'customer');

        const docRef = await db.collection('users').add({
            ...userData,
            role,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        });
        res.status(200).json({ message: 'User added successfully', id: docRef.id });
    } catch (error) {
        console.error('Add User Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                phone: data.phone,
                role: data.role || (data.name && data.name.toLowerCase() === 'admin' ? 'admin' : 'customer'),
                createdAt: data.createdAt
            };
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.checkout = async (req, res) => {
    try {
        const { cart, userId, userName, shippingDetails } = req.body;

        if (!cart || Object.keys(cart).length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const itemsList = Object.values(cart);

        // 1. Verify Stock availability
        for (const item of itemsList) {
            if (item.id) {
                const itemDoc = await db.collection('inventory').doc(item.id).get();
                if (itemDoc.exists) {
                    const currentStock = Number(itemDoc.data().op_stock || 0);
                    if (currentStock < item.quantity) {
                        return res.status(400).json({
                            message: `Insufficient stock for "${item.itemName}". Available: ${currentStock}, Requested: ${item.quantity}`
                        });
                    }
                }
            }
        }

        // 2. Decrement Stock
        for (const item of itemsList) {
            if (item.id) {
                const itemRef = db.collection('inventory').doc(item.id);
                const itemDoc = await itemRef.get();
                if (itemDoc.exists) {
                    const currentStock = Number(itemDoc.data().op_stock || 0);
                    const newStock = Math.max(0, currentStock - item.quantity);
                    await itemRef.update({ op_stock: newStock });
                }
            }
        }

        // 3. Create Order Record
        const orderData = {
            userId: userId || 'UnknownUser',
            userName: userName || 'Unknown',
            items: cart,
            shippingDetails: shippingDetails || {},
            status: "Pending",
            createdAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('orders').add(orderData);

        res.status(200).json({ message: "Order placed successfully!", orderId: docRef.id });
    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, failureReason, packingRemarks, packedItems } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        const updateObj = {
            status,
            updatedAt: new Date().toISOString()
        };
        if (failureReason !== undefined) updateObj.failureReason = failureReason;
        if (packingRemarks !== undefined) updateObj.packingRemarks = packingRemarks;
        if (packedItems !== undefined) updateObj.packedItems = packedItems;

        await db.collection('orders').doc(id).update(updateObj);
        res.status(200).json({ message: "Order status updated successfully" });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- CUSTOMER OTP & PROFILE API ---
exports.customerSendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile || mobile.length < 10) {
            return res.status(400).json({ message: "Valid mobile number is required" });
        }
        // Simulated 4-digit OTP
        const otp = "1234";
        console.log(`[OTP Simulated] Customer Mobile: ${mobile}, OTP: ${otp}`);
        res.status(200).json({ message: "OTP sent successfully", otp });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.customerVerifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return res.status(400).json({ message: "Mobile number and OTP are required" });
        }
        if (otp !== "1234") {
            return res.status(400).json({ message: "Invalid OTP. Please use 1234 for test login." });
        }
        
        // Search customer by mobile
        const snapshot = await db.collection('customers').where('mobile', '==', mobile).get();
        if (snapshot.empty) {
            return res.status(200).json({
                message: "OTP verified. New customer profile required.",
                isNew: true,
                mobile
            });
        }

        const customerDoc = snapshot.docs[0];
        const customerData = customerDoc.data();
        
        // Check if profile details are incomplete
        const isComplete = Boolean(customerData.name && customerData.name.trim() !== '');

        res.status(200).json({
            message: "Login successful",
            isNew: !isComplete,
            customer: { id: customerDoc.id, ...customerData }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCustomerProfile = async (req, res) => {
    try {
        const { id, name, mobile, email, addresses } = req.body;
        if (!mobile) {
            return res.status(400).json({ message: "Mobile number is required" });
        }

        let docId = id;
        if (!docId) {
            // Find existing doc by mobile if id not given
            const snap = await db.collection('customers').where('mobile', '==', mobile).get();
            if (!snap.empty) {
                docId = snap.docs[0].id;
            }
        }

        const customerPayload = {
            name: name || '',
            mobile,
            email: email || '',
            addresses: addresses || [],
            updatedAt: new Date().toISOString()
        };

        if (docId) {
            await db.collection('customers').doc(docId).update(customerPayload);
            res.status(200).json({ message: "Profile updated successfully", customer: { id: docId, ...customerPayload } });
        } else {
            customerPayload.createdAt = new Date().toISOString();
            const docRef = await db.collection('customers').add(customerPayload);
            res.status(201).json({ message: "Profile created successfully", customer: { id: docRef.id, ...customerPayload } });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCustomerProfile = async (req, res) => {
    try {
        const { idOrMobile } = req.params;
        let doc = await db.collection('customers').doc(idOrMobile).get();
        if (doc.exists) {
            return res.status(200).json({ id: doc.id, ...doc.data() });
        }
        
        const snap = await db.collection('customers').where('mobile', '==', idOrMobile).get();
        if (!snap.empty) {
            return res.status(200).json({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
        
        res.status(404).json({ message: "Customer not found" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- RIDER MASTER & RIDER AUTH API ---
exports.riderVerifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return res.status(400).json({ message: "Mobile number and OTP are required" });
        }
        if (otp !== "1234") {
            return res.status(400).json({ message: "Invalid OTP. Use 1234 for testing." });
        }

        // Query riders collection
        const snap = await db.collection('riders').where('mobile', '==', mobile).get();
        if (snap.empty) {
            return res.status(403).json({ message: "No Rider account found with this mobile number. Riders can only be registered by Admin." });
        }

        const riderDoc = snap.docs[0];
        const riderData = riderDoc.data();

        if (riderData.status && riderData.status.toLowerCase() === 'inactive') {
            return res.status(403).json({ message: "Your rider account is deactivated. Please contact Admin." });
        }

        res.status(200).json({
            message: "Rider login successful",
            rider: { id: riderDoc.id, ...riderData }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRiders = async (req, res) => {
    try {
        const snap = await db.collection('riders').get();
        const riders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(riders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addRider = async (req, res) => {
    try {
        const { name, mobile, bikeNumber, rcNumber, licenseNumber, status } = req.body;
        if (!name || !mobile) {
            return res.status(400).json({ message: "Rider name and mobile number are required" });
        }
        
        // Check duplicate mobile
        const snap = await db.collection('riders').where('mobile', '==', mobile).get();
        if (!snap.empty) {
            return res.status(400).json({ message: "A rider with this mobile number already exists" });
        }

        const newRider = {
            name,
            mobile,
            bikeNumber: bikeNumber || '',
            rcNumber: rcNumber || '',
            licenseNumber: licenseNumber || '',
            status: status || 'Active',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('riders').add(newRider);
        res.status(201).json({ message: "Rider account created successfully", rider: { id: docRef.id, ...newRider } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRider = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        data.updatedAt = new Date().toISOString();

        await db.collection('riders').doc(id).update(data);
        res.status(200).json({ message: "Rider details updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- PACKING & DISPATCH MODULE APIS ---
exports.packOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { packedItems, packingRemarks } = req.body;
        
        await db.collection('orders').doc(id).update({
            status: "Packed",
            packedItems: packedItems || [],
            packingRemarks: packingRemarks || '',
            packedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        res.status(200).json({ message: "Order marked as Packed successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.dispatchOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { riderId, riderName, riderMobile, vehicleDetails, dispatchTime } = req.body;
        
        if (!riderId) {
            return res.status(400).json({ message: "Assigned Rider selection is required" });
        }

        await db.collection('orders').doc(id).update({
            status: "Dispatched",
            assignedRiderId: riderId,
            assignedRiderName: riderName || '',
            assignedRiderMobile: riderMobile || '',
            vehicleDetails: vehicleDetails || '',
            dispatchTime: dispatchTime || new Date().toLocaleTimeString(),
            dispatchedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({ message: "Order dispatched and Rider assigned successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRiderOrders = async (req, res) => {
    try {
        const { riderId } = req.params;
        const snap = await db.collection('orders').get();
        const allOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter by assignedRiderId or assignedRiderMobile
        const riderOrders = allOrders.filter(o => o.assignedRiderId === riderId || o.assignedRiderMobile === riderId);
        res.status(200).json(riderOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRiderOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, failureReason } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updateData = {
            status,
            updatedAt: new Date().toISOString()
        };
        if (failureReason) updateData.failureReason = failureReason;

        await db.collection('orders').doc(id).update(updateData);
        res.status(200).json({ message: `Order status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- STOCK INWARD / PURCHASE ENTRY API ---
exports.createPurchaseEntry = async (req, res) => {
    try {
        const { vendorName, invoiceNo, date, productId, productName, purchaseRate, quantity, totalCost, remarks } = req.body;
        
        if (!vendorName || !productId || !quantity) {
            return res.status(400).json({ message: "Vendor name, product selection, and quantity are required" });
        }

        const purchaseRecord = {
            vendorName,
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

        const docRef = await db.collection('purchases').add(purchaseRecord);

        // Update product opening stock (op_stock) in inventory collection
        const itemRef = db.collection('inventory').doc(productId);
        const itemDoc = await itemRef.get();
        if (itemDoc.exists) {
            const currentStock = Number(itemDoc.data().op_stock || 0);
            const updatedStock = currentStock + Number(quantity);
            await itemRef.update({ op_stock: updatedStock });
        }

        res.status(201).json({ message: "Stock Inward Purchase recorded & inventory stock updated!", id: docRef.id });
    } catch (error) {
        console.error("Purchase Entry Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getPurchases = async (req, res) => {
    try {
        const snap = await db.collection('purchases').orderBy('createdAt', 'desc').get();
        const purchases = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};