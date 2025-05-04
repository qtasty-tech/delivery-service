const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const deliveryRoutes = require('./routes/deliveryRoutes');
const { startConsumer } = require('./kafka/consumer');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', deliveryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});



const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected');

    // Start Kafka consumer
    console.log('Starting Kafka consumer...');
    await startConsumer();

    // Start server
    app.listen(PORT, () => {
      console.log(`Delivery Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Delivery Service:', error);
    process.exit(1); // Exit to allow Docker to restart
  }
};

// Ensure single execution
if (!module.parent) {
  startServer();
}

module.exports = app; 