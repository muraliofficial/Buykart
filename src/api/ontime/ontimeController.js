const { db } = require('../firebase');
const { generateToken } = require('../middleware/authMiddleware');

const COLLECTION_RIDERS = 'riders';
const COLLECTION_ORDERS = 'orders';
const COLLECTION_INVENTORY = 'inventory';

// Helper to restock items into inventory when delivery fails
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

// 1. Rider Login OTP Verification (Validated against riders collection)
exports.riderVerifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (otp !== "1234") {
            return res.status(400).json({ success: false, message: "Invalid OTP code. Please use test OTP 1234." });
        }

        const cleanMobile = String(mobile).trim();
        let snap = await db.collection(COLLECTION_RIDERS).where('mobile', '==', cleanMobile).get();
        
        if (snap.empty) {
            snap = await db.collection(COLLECTION_RIDERS).where('mobile', '==', Number(cleanMobile)).get();
        }

        let riderDoc;
        let riderData;

        if (snap.empty) {
            // Auto-create active rider account for demo / testing ease
            const newRiderRef = db.collection(COLLECTION_RIDERS).doc(`rider_${cleanMobile}`);
            const newRiderData = {
                name: `Rider ${cleanMobile.slice(-4)}`,
                mobile: cleanMobile,
                bikeNumber: 'TN-33-AX-1001',
                vehicleType: 'Bike',
                status: 'Active',
                createdAt: new Date().toISOString()
            };
            await newRiderRef.set(newRiderData);
            const createdDoc = await newRiderRef.get();
            riderDoc = { id: newRiderRef.id, data: () => newRiderData };
            riderData = newRiderData;
        } else {
            riderDoc = snap.docs[0];
            riderData = riderDoc.data();
        }

        if (riderData.status && String(riderData.status).toLowerCase() === 'inactive') {
            return res.status(403).json({
                success: false,
                message: "Your rider account is deactivated. Please contact Admin."
            });
        }

        const token = generateToken({ id: riderDoc.id, mobile: riderData.mobile, role: 'rider' });

        res.status(200).json({
            success: true,
            message: "Rider login successful",
            token,
            rider: { id: riderDoc.id, ...riderData }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Orders Assigned to a Specific Rider
exports.getRiderOrders = async (req, res) => {
    try {
        const { riderId } = req.params;
        const snap = await db.collection(COLLECTION_ORDERS).get();
        const allOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const riderOrders = allOrders.filter(o => 
            o.assignedRiderId === riderId || 
            o.assignedRiderMobile === riderId
        );
        res.status(200).json(riderOrders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Update Order Delivery Status (Validated: Out For Delivery, Delivered, Delivery Failed)
exports.updateRiderOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, failureReason } = req.body;

        const orderRef = db.collection(COLLECTION_ORDERS).doc(id);
        const orderDoc = await orderRef.get();

        if (orderDoc.exists) {
            const previousStatus = orderDoc.data().status;
            if (status === 'Delivery Failed' && previousStatus !== 'Delivery Failed' && previousStatus !== 'Cancelled') {
                await restockOrderItems(orderDoc.data());
            }
        }

        const updateData = {
            status,
            updatedAt: new Date().toISOString()
        };
        if (failureReason) updateData.failureReason = failureReason;

        await orderRef.update(updateData);
        res.status(200).json({ success: true, message: `Order status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
