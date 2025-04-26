// delivery-service/src/models/Rider.js
const mongoose = require('mongoose');

// delivery-service/src/models/Rider.js
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
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { versionKey: false });

const Rider = mongoose.model('Rider', RiderSchema);

module.exports = Rider;
