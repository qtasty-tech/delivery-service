// delivery-service/src/repositories/deliveryRepository.js
const Rider = require('../models/Rider');
const Delivery = require('../models/Delivery');

// Create a new rider
const createRider = async (riderData) => {
  const rider = new Rider(riderData);
  await rider.save();
  return rider;
};

// Get rider by ID
const getRiderById = async (riderId) => {
  return await Rider.findById(riderId);
};

// Create a new delivery
const createDelivery = async (deliveryData) => {
  const delivery = new Delivery(deliveryData);
  await delivery.save();
  return delivery;
};

// Get delivery by ID
const getDeliveryById = async (deliveryId) => {
  return await Delivery.findById(deliveryId).populate('rider').populate('orderId');
};

// Get all deliveries for a rider
const getDeliveriesByRider = async (riderId) => {
  return await Delivery.find({ rider: riderId }).populate('orderId');
};

// Update delivery status
const updateDeliveryStatus = async (deliveryId, status, earnings) => {
  return await Delivery.findByIdAndUpdate(deliveryId, { status, earnings }, { new: true });
};

module.exports = {
  createRider,
  getRiderById,
  createDelivery,
  getDeliveryById,
  getDeliveriesByRider,
  updateDeliveryStatus,
};
