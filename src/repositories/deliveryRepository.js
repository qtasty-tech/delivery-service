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

// Get rider by user ID
const getRiderByUserId = async (userId) => {
  return await Rider.findOne({ user: userId });
}

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

// Get pending delivery for a rider
const getPendingDeliveryByRider = async (riderId) => {
  return await Delivery.findOne({ rider: riderId, status: 'assigned' });
};

// Get active delivery for a rider
const getActiveDeliveryByRider = async (riderId) => {
  return await Delivery.findOne({
    rider: riderId,
    status: { $in: ['in-progress', 'pick-up', 'en_route'] },
  });
};

// Update delivery status
const updateDeliveryStatus = async (deliveryId, status, earnings) => {
  return await Delivery.findByIdAndUpdate(
    deliveryId,
    { status, earnings, ...(status === 'completed' ? { endTime: new Date() } : {}) },
    { new: true }
  );
};

// Accept delivery
const acceptDelivery = async (deliveryId) => {
  return await Delivery.findByIdAndUpdate(
    deliveryId,
    { status: 'in-progress', startTime: new Date() },
    { new: true }
  );
};

// Decline delivery
const declineDelivery = async (deliveryId) => {
  return await Delivery.findByIdAndUpdate(
    deliveryId,
    { status: 'failed' },
    { new: true }
  );
};

module.exports = {
  createRider,
  getRiderById,
  createDelivery,
  getDeliveryById,
  getRiderByUserId, 
  getDeliveriesByRider,
  updateDeliveryStatus,
  getPendingDeliveryByRider,
  getActiveDeliveryByRider,
  acceptDelivery,
  declineDelivery
};
