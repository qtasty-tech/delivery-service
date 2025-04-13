// delivery-service/src/index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const deliveryRoutes = require('./routes/deliveryRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 6000;

app.use(express.json());

// Use delivery routes
app.use('/api/deliveries', deliveryRoutes);

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Delivery Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
