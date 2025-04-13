// delivery-service/src/models/Rider.js
const mongoose = require('mongoose');

const RiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  vehicle: { type: String, required: true }, // e.g., car, bike
  license: { type: String, required: true },
  insurance: { type: String, required: true },
  isActive: { type: Boolean, default: true }, // Active or inactive rider
  earnings: { type: Number, default: 0 }, // Rider's total earnings
  createdAt: { type: Date, default: Date.now },
});

const Rider = mongoose.model('Rider', RiderSchema);

module.exports = Rider;
