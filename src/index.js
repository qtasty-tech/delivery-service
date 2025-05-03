const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const deliveryRoutes = require('./routes/deliveryRoutes');
const { startConsumer } = require('./kafka/consumer');
const { getDeliveryStatus } = require('./helpers/deliveryService');  // Import helper function

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api', deliveryRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// SSE route to stream delivery status updates
app.get('/api/delivery-progress/:orderId', async (req, res) => {
  const { orderId } = req.params;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendDeliveryUpdate = async () => {
    try {
      // Fetch delivery status from the Delivery model
      const deliveryStatus = await getDeliveryStatus(orderId);
      res.write(`data: ${JSON.stringify({ deliveryStatus })}\n\n`);
    } catch (error) {
      console.error('Error fetching delivery status:', error);
      res.write(`data: ${JSON.stringify({ deliveryStatus: 'error' })}\n\n`);
    }
  };

  // Call sendDeliveryUpdate every 5 seconds
  const intervalId = setInterval(sendDeliveryUpdate, 5000);

  // Close SSE connection when the client disconnects
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

// Connect to MongoDB and start Kafka consumer
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);  // Use environment variables for the DB URL
    console.log('MongoDB connected');

    console.log('Starting Kafka consumer...');
    await startConsumer();

    // Start the Express app on the specified port
    app.listen(PORT, () => {
      console.log(`Delivery Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Delivery Service:', error);
    process.exit(1); // Exit to allow Docker to restart
  }
};

// Start the server
startServer();

module.exports = app;
