// delivery-service/src/models/Delivery.js
const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true },
  status: { type: String, enum: ['assigned', 'in-progress', 'completed', 'failed'], default: 'assigned' },
  startTime: { type: Date },
  endTime: { type: Date },
  deliveryAddress: { type: String, required: true },
  deliveryTime: { type: Date, required: true },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Delivery = mongoose.model('Delivery', DeliverySchema);

module.exports = Delivery;
