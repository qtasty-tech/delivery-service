// delivery-service/src/routes/deliveryRoutes.js
const express = require('express');
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create a rider (protected route)
router.post('/riders', authMiddleware, deliveryController.createRider);

// Get rider by ID (protected route)
router.get('/riders/:riderId', authMiddleware, deliveryController.getRiderById);

// Create a new delivery (protected route)
router.post('/deliveries', authMiddleware, deliveryController.createDelivery);

// Get delivery by ID (protected route)
router.get('/deliveries/:deliveryId', authMiddleware, deliveryController.getDeliveryById);

// Update delivery status (protected route)
router.put('/deliveries/:deliveryId/status/:status', authMiddleware, deliveryController.updateDeliveryStatus);

module.exports = router;
