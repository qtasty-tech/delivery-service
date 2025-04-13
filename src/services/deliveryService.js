// delivery-service/src/services/deliveryService.js
const deliveryRepository = require('../repositories/deliveryRepository');

// Create a new rider
const createRider = async (riderData) => {
  const rider = await deliveryRepository.createRider(riderData);
  return rider;
};

// Get rider by ID
const getRiderById = async (riderId) => {
  const rider = await deliveryRepository.getRiderById(riderId);
  return rider;
};

// Create a new delivery
const createDelivery = async (deliveryData) => {
  const delivery = await deliveryRepository.createDelivery(deliveryData);
  return delivery;
};

// Get delivery by ID
const getDeliveryById = async (deliveryId) => {
  const delivery = await deliveryRepository.getDeliveryById(deliveryId);
  return delivery;
};

// Get all deliveries for a rider
const getDeliveriesByRider = async (riderId) => {
  const deliveries = await deliveryRepository.getDeliveriesByRider(riderId);
  return deliveries;
};

// Update delivery status
const updateDeliveryStatus = async (deliveryId, status, earnings) => {
  const updatedDelivery = await deliveryRepository.updateDeliveryStatus(deliveryId, status, earnings);
  return updatedDelivery;
};

module.exports = {
  createRider,
  getRiderById,
  createDelivery,
  getDeliveryById,
  getDeliveriesByRider,
  updateDeliveryStatus,
};
