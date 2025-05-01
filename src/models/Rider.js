// delivery-service/src/models/Rider.js
const mongoose = require('mongoose');

const RiderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: { 
    type: String, 
    required: true,
    enum: ['bicycle', 'motorcycle', 'car', 'van']
  },
  license: { 
    type: String, 
    required: true 
  },
  insurance: { 
    type: String, 
    required: true 
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: { 
    type: Boolean, 
    default: false 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],  
      required: true,
    },
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { versionKey: false });

// Create a 2dsphere index for geospatial queries
RiderSchema.index({ location: '2dsphere' });

const Rider = mongoose.model('Rider', RiderSchema);

module.exports = Rider;
