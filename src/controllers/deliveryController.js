// delivery-service/src/controllers/deliveryController.js
const deliveryService = require('../services/deliveryService');

const createRider = async (req, res) => {
  try {
   
    const userId = req.body.userId || req.headers['user-id'];

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!req.files) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    
    const riderData = {
      ...req.body,  
      license: req.files.license[0].path,
      insurance: req.files.insurance[0].path,
      user: userId,  
    };

    
    

   
    const rider = await deliveryService.createRider(riderData);

    res.status(201).json({ 
      message: 'Documents uploaded successfully. Account pending verification.',
      rider
    });
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Document upload failed',
      details: error.errors 
    });
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
