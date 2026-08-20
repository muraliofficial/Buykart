const { db } = require('../firebase');
const { generateToken } = require('../middleware/authMiddleware');

const COLLECTION_PRODUCTS = 'products';
const COLLECTION_INVENTORY = 'inventory';
const COLLECTION_CUSTOMERS = 'customers';
const COLLECTION_ORDERS = 'orders';

// 1. Get All Products for Storefront
exports.getAllProducts = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION_INVENTORY).get();
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Single Product By ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection(COLLECTION_INVENTORY).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Send Customer OTP (Simulated 1234)
exports.customerSendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        const otp = "1234";
        console.log(`[Website OTP] Sent to Customer: ${mobile}, OTP: ${otp}`);
        res.status(200).json({ success: true, message: "OTP sent successfully", otp });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Verify Customer OTP
exports.customerVerifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (otp !== "1234") {
            return res.status(400).json({ success: false, message: "Invalid OTP code. Please use test OTP 1234." });
        }
        
        const snapshot = await db.collection(COLLECTION_CUSTOMERS).where('mobile', '==', String(mobile).trim()).get();
        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                message: "OTP verified. Customer profile details required.",
                isNew: true,
                mobile
            });
        }

        const customerDoc = snapshot.docs[0];
        const customerData = customerDoc.data();
        const isComplete = Boolean(customerData.name && customerData.name.trim() !== '');

        const token = generateToken({ id: customerDoc.id, mobile: customerData.mobile, role: 'customer' });

        res.status(200).json({
            success: true,
            message: "Customer login successful",
            isNew: !isComplete,
            token,
            customer: { id: customerDoc.id, ...customerData }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Update/Save Customer Profile (Validated)
exports.updateCustomerProfile = async (req, res) => {
    try {
        const { id, name, mobile, email, addresses } = req.body;

        let docId = id;
        if (!docId) {
            const snap = await db.collection(COLLECTION_CUSTOMERS).where('mobile', '==', String(mobile).trim()).get();
            if (!snap.empty) {
                docId = snap.docs[0].id;
            }
        }

        const customerPayload = {
            name: name.trim(),
            mobile: String(mobile).trim(),
            email: email ? String(email).trim() : '',
            addresses: Array.isArray(addresses) ? addresses : [],
            updatedAt: new Date().toISOString()
        };

        let savedId = docId;
        if (docId) {
            await db.collection(COLLECTION_CUSTOMERS).doc(docId).update(customerPayload);
        } else {
            customerPayload.createdAt = new Date().toISOString();
            const docRef = await db.collection(COLLECTION_CUSTOMERS).add(customerPayload);
            savedId = docRef.id;
        }

        const token = generateToken({ id: savedId, mobile: customerPayload.mobile, role: 'customer' });

        res.status(200).json({
            success: true,
            message: "Customer profile updated successfully",
            token,
            customer: { id: savedId, ...customerPayload }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Get Customer Profile
exports.getCustomerProfile = async (req, res) => {
    try {
        const { idOrMobile } = req.params;
        let doc = await db.collection(COLLECTION_CUSTOMERS).doc(idOrMobile).get();
        if (doc.exists) {
            return res.status(200).json({ id: doc.id, ...doc.data() });
        }
        
        const snap = await db.collection(COLLECTION_CUSTOMERS).where('mobile', '==', idOrMobile).get();
        if (!snap.empty) {
            return res.status(200).json({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
        
        res.status(404).json({ success: false, message: "Customer profile not found" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Customer Storefront Checkout (Atomic Stock Transaction Guard)
exports.checkout = async (req, res) => {
    try {
        const { cart, userId, userName, customerId, customerName, customerMobile, shippingDetails } = req.body;
        const itemsList = Object.values(cart || {});

        if (!itemsList.length) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }

        // Execute atomic stock check and stock decrement transaction
        const transactionResult = await db.runTransaction(async (transaction) => {
            const updates = [];
            for (const item of itemsList) {
                if (item.id) {
                    const itemRef = db.collection(COLLECTION_INVENTORY).doc(item.id);
                    const itemDoc = await transaction.get(itemRef);

                    if (!itemDoc.exists) {
                        throw new Error(`Item "${item.itemName}" no longer exists in inventory.`);
                    }

                    const currentStock = Number(itemDoc.data().op_stock || 0);
                    if (currentStock < item.quantity) {
                        throw new Error(`Insufficient stock for "${item.itemName}". Available: ${currentStock}, Requested: ${item.quantity}`);
                    }

                    const newStock = currentStock - item.quantity;
                    updates.push({ ref: itemRef, newStock });
                }
            }

            // Apply stock updates
            for (const u of updates) {
                transaction.update(u.ref, { op_stock: u.newStock });
            }

            return true;
        });

        // Create Order Record in 'orders' collection
        const totalCalc = itemsList.reduce((sum, i) => sum + Number(i.price || 0) * (i.quantity || 1), 0);
        
        const orderData = {
            userId: userId || customerId || 'Guest',
            userName: userName || customerName || shippingDetails?.fullName || 'Customer',
            customerId: customerId || userId || null,
            customerName: customerName || userName || shippingDetails?.fullName || 'Customer',
            customerMobile: customerMobile || shippingDetails?.phone || '',
            items: cart,
            total: totalCalc,
            paymentMethod: shippingDetails?.paymentMethod || 'COD',
            paymentStatus: 'Pending',
            deliveryAddress: shippingDetails?.address ? `${shippingDetails.address}, Pincode: ${shippingDetails.pincode}` : '',
            shippingDetails: shippingDetails || {},
            status: "Pending",
            createdAt: new Date().toISOString()
        };
        
        const docRef = await db.collection(COLLECTION_ORDERS).add(orderData);
        res.status(200).json({ success: true, message: "Order placed successfully!", orderId: docRef.id });
    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// 8. Get Customer Orders (Filtered server-side if customerId or mobile query parameter is present)
exports.getOrders = async (req, res) => {
    try {
        const { customerId, mobile } = req.query;
        const snapshot = await db.collection(COLLECTION_ORDERS).orderBy('createdAt', 'desc').get();
        let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (customerId || mobile) {
            const cleanCustId = customerId ? String(customerId).trim() : null;
            const cleanMob = mobile ? String(mobile).trim() : null;

            orders = orders.filter(o =>
                (cleanCustId && (o.userId === cleanCustId || o.customerId === cleanCustId)) ||
                (cleanMob && (o.customerMobile === cleanMob || o.shippingDetails?.phone === cleanMob))
            );
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Save Contact Us Form Message
exports.saveContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Name, email, and message are required" });
        }
        const contactDoc = {
            name: String(name).trim(),
            email: String(email).trim(),
            message: String(message).trim(),
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('contacts').add(contactDoc);
        res.status(201).json({ success: true, message: "Message saved successfully!", id: docRef.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
