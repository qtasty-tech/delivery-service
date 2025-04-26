// delivery-service/src/index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const deliveryRoutes = require('./routes/deliveryRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors())

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
