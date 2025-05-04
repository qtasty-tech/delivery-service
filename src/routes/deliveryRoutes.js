// delivery-service/src/routes/deliveryRoutes.js
const express = require('express');
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const router = express.Router();

// ======================
// Rider Routes
// ======================

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

// Get rider by ID (protected route)
router.get('/riders/:riderId', authMiddleware, deliveryController.getRiderById);

// Get rider by user ID (protected route)
router.get('/riders/user/:userId', deliveryController.getRiderByUserId);

// Update rider location (protected route)
router.put('/riders/updateLocation/:riderId', authMiddleware, deliveryController.updateLocation);

// ======================
// Delivery Routes
// ======================

// Create a new delivery (protected route)
router.post('/deliveries', authMiddleware, deliveryController.createDelivery);

// Get delivery by ID (protected route)
router.get('/deliveries/:deliveryId', authMiddleware, deliveryController.getDeliveryById);

// Get delivery status by order ID (public route for SSE)
router.get('/deliveries/status/:orderId', deliveryController.getDeliveryStatus);

// Get pending delivery for a rider (protected route)
router.get('/deliveries/pending/:riderId', deliveryController.getPendingDelivery);

// Get active delivery for a rider (protected route)
router.get('/deliveries/active/:riderId', authMiddleware, deliveryController.getActiveDelivery);

// Delivery status updates via SSE (public route)
router.get('/deliveries/progress/:orderId', deliveryController.streamDeliveryStatus);

// Update delivery status (protected route)
router.put('/deliveries/:deliveryId/status/:status', authMiddleware, deliveryController.updateDeliveryStatus);

// Accept delivery (protected route)
router.put('/deliveries/:deliveryId/accept', authMiddleware, deliveryController.acceptDelivery);

// Decline delivery (protected route)
router.put('/deliveries/:deliveryId/decline', authMiddleware, deliveryController.declineDelivery);

module.exports = router;