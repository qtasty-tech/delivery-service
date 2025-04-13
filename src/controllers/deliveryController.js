// delivery-service/src/controllers/deliveryController.js
const deliveryService = require('../services/deliveryService');

// Create a new rider
const createRider = async (req, res) => {
  try {
    const riderData = req.body;
    const rider = await deliveryService.createRider(riderData);
    res.status(201).json({ message: 'Rider created successfully', rider });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get rider by ID
const getRiderById = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await deliveryService.getRiderById(riderId);
    res.status(200).json({ rider });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create a new delivery
const createDelivery = async (req, res) => {
  try {
    const deliveryData = req.body;
    const delivery = await deliveryService.createDelivery(deliveryData);
    res.status(201).json({ message: 'Delivery created successfully', delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await deliveryService.getDeliveryById(deliveryId);
    res.status(200).json({ delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId, status } = req.params;
    const { earnings } = req.body;
    const updatedDelivery = await deliveryService.updateDeliveryStatus(deliveryId, status, earnings);
    res.status(200).json({ message: 'Delivery status updated', updatedDelivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createRider,
  getRiderById,
  createDelivery,
  getDeliveryById,
  updateDeliveryStatus,
};
