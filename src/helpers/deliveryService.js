const mongoose = require('mongoose');
const Delivery = require('../models/Delivery'); // Delivery model

// Helper function to get delivery status
const getDeliveryStatus = async (orderId) => {
  try {
    // Validate if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid orderId format');
    }

    // Convert orderId to ObjectId properly using 'new'
    const orderObjectId = new mongoose.Types.ObjectId(orderId);

    // Fetch delivery status from the Delivery model
    const delivery = await Delivery.findOne({ orderId: orderObjectId });

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    return delivery.status;  // Return the delivery status
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    throw new Error(error.message);
  }
};

module.exports = { getDeliveryStatus };
