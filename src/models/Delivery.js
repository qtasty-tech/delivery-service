// delivery-service/src/models/Delivery.js
const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
  status: {
    type: String,
    enum: [
      "assigned",
      "in-progress",
      "pick-up",
      "en_route",
      "completed",
      "failed",
    ],
    default: "assigned",
  },
  restaurant: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    phone: { type: String },
  },
  customer: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },
    phone: { type: String },
  },
  orderCode: {
    type: String,
    required: true,
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  specialInstructions: {
    type: String,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  startTime: { type: Date },
  endTime: { type: Date },
  deliveryAddress: { type: String, required: true },
  deliveryTime: { type: Date, required: true },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

DeliverySchema.index({ 'restaurant.location': '2dsphere', 'customer.location': '2dsphere' });

const Delivery = mongoose.model("Delivery", DeliverySchema);

module.exports = Delivery;
