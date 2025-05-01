// delivery-service/src/routes/deliveryRoutes.js
const express = require('express');
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const router = express.Router();

// Create a rider (protected route)
router.post(
  '/riders',
  authMiddleware,
  upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'insurance', maxCount: 1 }
  ]),
  deliveryController.createRider
);

// Create a new delivery (protected route)
router.post('/deliveries', authMiddleware, deliveryController.createDelivery);

// Get rider by ID (protected route)
router.get('/riders/:riderId', authMiddleware, deliveryController.getRiderById);

// Get rider by user ID (protected route)
router.get('/riders/user/:userId', deliveryController.getRiderByUserId);

// Get pending delivery for a rider (protected route)
router.get('/deliveries/pending/:riderId', authMiddleware, deliveryController.getPendingDelivery);

// Get active delivery for a rider (protected route)
router.get('/deliveries/active/:riderId', authMiddleware, deliveryController.getActiveDelivery);

// Get delivery by ID (protected route)
router.get('/deliveries/:deliveryId', authMiddleware, deliveryController.getDeliveryById);

// Update rider location (protected route)
router.put('/riders/updateLocation/:riderId', authMiddleware, deliveryController.updateLocation);

// Update delivery status (protected route)
router.put('/deliveries/:deliveryId/status/:status', authMiddleware, deliveryController.updateDeliveryStatus);

// Accept delivery (protected route)
router.put('/deliveries/:deliveryId/accept', authMiddleware, deliveryController.acceptDelivery);

// Decline delivery (protected route)
router.put('/deliveries/:deliveryId/decline', authMiddleware, deliveryController.declineDelivery);

module.exports = router;
