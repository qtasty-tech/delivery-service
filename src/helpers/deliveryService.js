const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

const getDeliveryStatus = async (orderId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid orderId format');
    }

    const delivery = await Delivery.findOne({ orderId }).lean();
    return delivery ? { status: delivery.status, found: true } : { status: 'pending', found: false };
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    throw error;
  }
};

const streamDeliveryStatus = async (req, res) => {
  const { orderId } = req.params;

  // SSE setup
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Keep connection alive with periodic pings
  const keepAliveInterval = setInterval(() => {
    res.write(':ping\n\n');
  }, 30000);

  const sendUpdate = async () => {
    try {
      const { status } = await getDeliveryStatus(orderId);
      res.write(`data: ${JSON.stringify({
        deliveryStatus: status,
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      console.error('Delivery update error:', error);
      res.write(`event: error\ndata: ${JSON.stringify({
        error: 'Failed to fetch delivery status'
      })}\n\n`);
    }
  };

  // Initial update
  await sendUpdate();

  // Set up change stream if using MongoDB replica set
  let changeStream;
  try {
    changeStream = Delivery.watch([{
      $match: {
        'fullDocument.orderId': orderId,
        operationType: { $in: ['insert', 'update'] }
      }
    }]);

    changeStream.on('change', sendUpdate);
  } catch (err) {
    console.log('Falling back to polling - change streams not available');
    // Fallback to polling if change streams not available
    const pollInterval = setInterval(sendUpdate, 3000);
    req.on('close', () => clearInterval(pollInterval));
  }

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    if (changeStream) changeStream.close();
    res.end();
  });
};

module.exports = { getDeliveryStatus, streamDeliveryStatus };