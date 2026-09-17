const { db } = require('../firebase');
const { generateToken } = require('../middleware/authMiddleware');
const { cleanPhone } = require('../middleware/validator');

const COLLECTION_PRODUCTS = 'products';
const COLLECTION_INVENTORY = 'inventory';
const COLLECTION_CUSTOMERS = 'customers';
const COLLECTION_ORDERS = 'orders';

// Helper to restock items into inventory when order is cancelled
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
        
        const cleanMobile = cleanPhone(mobile);
        const snapshot = await db.collection(COLLECTION_CUSTOMERS).where('mobile', '==', cleanMobile).get();
        
        let customerDoc;
        let customerData;
        let isNew = false;

        if (snapshot.empty) {
            isNew = true;
            customerData = {
                name: '',
                mobile: cleanMobile,
                email: '',
                addresses: [],
                createdAt: new Date().toISOString()
            };
            const docRef = await db.collection(COLLECTION_CUSTOMERS).add(customerData);
            customerDoc = { id: docRef.id, data: () => customerData };
        } else {
            customerDoc = snapshot.docs[0];
            customerData = customerDoc.data();
            isNew = !customerData.name || customerData.name.trim() === '';
        }

        const token = generateToken({ id: customerDoc.id, mobile: cleanMobile, role: 'customer' });

        res.status(200).json({
            success: true,
            message: isNew ? "OTP verified. Customer profile details required." : "Customer login successful",
            isNew,
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
        const discountAmount = Number(shippingDetails?.discount || 0);
        const finalTotal = Math.max(0, totalCalc - discountAmount);
        
        const orderData = {
            userId: userId || customerId || req.customer?.id || 'Customer',
            userName: userName || customerName || shippingDetails?.fullName || 'Customer',
            customerId: customerId || userId || req.customer?.id || null,
            customerName: customerName || userName || shippingDetails?.fullName || 'Customer',
            customerMobile: customerMobile || shippingDetails?.phone || req.customer?.mobile || '',
            items: cart,
            subtotal: totalCalc,
            discount: discountAmount,
            appliedCoupon: shippingDetails?.appliedCoupon || null,
            total: finalTotal,
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

// 8. Get Customer Orders (Protected: restricted to verified customer identity)
exports.getOrders = async (req, res) => {
    try {
        const authCustomerId = req.customer?.id;
        const authCustomerMobile = cleanPhone(req.customer?.mobile);

        const customerId = authCustomerId || req.query.customerId;
        const mobile = authCustomerMobile || cleanPhone(req.query.mobile);

        // Security check: Never expose full database of customer orders to public callers
        if (!customerId && !mobile) {
            return res.status(200).json([]);
        }

        const snapshot = await db.collection(COLLECTION_ORDERS).orderBy('createdAt', 'desc').get();
        let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const cleanCustId = customerId ? String(customerId).trim() : null;
        const cleanMob = mobile ? String(mobile).trim() : null;

        orders = orders.filter(o => {
            const matchesId = cleanCustId && (o.userId === cleanCustId || o.customerId === cleanCustId);
            const matchesMob = cleanMob && (cleanPhone(o.customerMobile) === cleanMob || cleanPhone(o.shippingDetails?.phone) === cleanMob);
            return matchesId || matchesMob;
        });

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

// 10. Cancel Order (Customer self-service: only if status is 'Pending')
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const authCustomerId = req.customer?.id;
        const authCustomerMobile = cleanPhone(req.customer?.mobile);

        const orderRef = db.collection(COLLECTION_ORDERS).doc(id);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const orderData = orderDoc.data();
        const orderPhone = cleanPhone(orderData.customerMobile || orderData.shippingDetails?.phone);

        // Verify that this order belongs to the authenticated customer
        const isAuthorized = 
            (authCustomerId && (orderData.customerId === authCustomerId || orderData.userId === authCustomerId)) ||
            (authCustomerMobile && orderPhone === authCustomerMobile);

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "You are not authorized to cancel this order" });
        }

        const currentStatus = String(orderData.status || '').toLowerCase();
        if (currentStatus !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot cancel order in "${orderData.status}" stage. Please contact customer support.` 
            });
        }

        // Restock items back to inventory
        await restockOrderItems(orderData);

        await orderRef.update({
            status: "Cancelled",
            cancellationReason: "Cancelled by customer",
            cancelledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({ 
            success: true, 
            message: "Order cancelled successfully and items restocked to inventory." 
        });
    } catch (error) {
        console.error("Cancel Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
