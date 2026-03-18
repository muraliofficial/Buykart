const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('./controller');

// Configure Multer for disk storage.
// NOTE: Ensure the destination directory 'public/img/inventory' exists.
const uploadDir = path.join(__dirname, '../../public/img/inventory');

try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (error) {
    console.warn("Warning: Could not create upload directory. This is expected on read-only deployments (Vercel). File uploads will fail locally.", error.message);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

router.post('/products', controller.createProduct);
router.get('/products', controller.getAllProducts);
router.get('/products/:id', controller.getProductById);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

router.post('/login', controller.login);
router.post('/addUser', controller.addUser);
router.post('/addInventory', upload.single('inventoryImage'), controller.addInventory);
router.put('/updateInventory/:id', upload.single('inventoryImage'), controller.updateInventory);
router.delete('/deleteInventory/:id', controller.deleteInventory);
router.get('/getInventory', controller.getInventory);

module.exports = router;