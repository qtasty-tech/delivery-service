const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

const getDeliveryStatus = async (orderId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid orderId format');
    }

    const delivery = await Delivery.findOne({ orderId }).lean();
    if (!delivery) {
      return { status: 'pending', found: false };
    }
    return { status: delivery.status, found: true };
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    throw error;
  }
};

const streamDeliveryStatus = async (req, res) => {
  const { orderId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let isConnectionAlive = true;

  req.on('close', () => {
    isConnectionAlive = false;
    res.end();
  });

  const sendUpdate = async () => {
    if (!isConnectionAlive) return;

    try {
      const { status } = await getDeliveryStatus(orderId);
      res.write(`data: ${JSON.stringify({ deliveryStatus: status })}\n\n`);
    } catch (error) {
      console.error('Error in delivery update:', error);
      res.write(`data: ${JSON.stringify({ error: 'Delivery update failed' })}\n\n`);
    }
  };

  // Initial update
  await sendUpdate();

  // Periodic updates (every 3 seconds)
  const interval = setInterval(() => {
    if (isConnectionAlive) {
      sendUpdate();
    } else {
      clearInterval(interval);
    }
  }, 3000);
};

module.exports = { getDeliveryStatus, streamDeliveryStatus };