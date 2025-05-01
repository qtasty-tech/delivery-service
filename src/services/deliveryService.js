// delivery-service/src/services/deliveryService.js
const deliveryRepository = require('../repositories/deliveryRepository');
const axios = require('axios');

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

// Get rider by user ID
const getRiderByUserId = async (userId) => {
  const rider = await deliveryRepository.getRiderByUserId(userId);
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
  
  // If delivery is completed, update order status to completed
  if (status === 'completed') {
    try {
      await axios.put(
        `http://order-service:7000/api/orders/${updatedDelivery.orderId}/status/completed`,
        {},
        {
          headers: { Authorization: `Bearer ${process.env.JWT_TOKEN || ''}` },
        }
      );
    } catch (error) {
      console.error('Error updating order status:', error.message);
    }
  }

  return updatedDelivery;
};
// Get pending delivery for a rider
const getPendingDeliveryByRider = async (riderId) => {
  return await deliveryRepository.getPendingDeliveryByRider(riderId);
};

// Get active delivery for a rider
const getActiveDeliveryByRider = async (riderId) => {
  return await deliveryRepository.getActiveDeliveryByRider(riderId);
};

// Accept delivery
const acceptDelivery = async (deliveryId) => {
  return await deliveryRepository.acceptDelivery(deliveryId);
};

// Decline delivery
const declineDelivery = async (deliveryId) => {
  return await deliveryRepository.declineDelivery(deliveryId);
};

module.exports = {
  createRider,
  getRiderById,
  getRiderByUserId,
  createDelivery,
  getDeliveryById,
  getDeliveriesByRider,
  updateDeliveryStatus,
  getPendingDeliveryByRider,
  getActiveDeliveryByRider,
  acceptDelivery,
  declineDelivery
};
