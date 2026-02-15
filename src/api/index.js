const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('./controller');

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

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