// delivery-service/src/controllers/deliveryController.js
const deliveryService = require('../services/deliveryService');
const cloudinary = require('cloudinary').v2;
const Rider = require('../models/Rider'); 
const Delivery = require('../models/Delivery');
const mongoose = require('mongoose');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createRider = async (req, res) => {
  try {
    const userId = req.body.userId || req.headers['user-id'];

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!req.files || !req.files.license || !req.files.insurance) {
      return res.status(400).json({ message: 'License and insurance files are required' });
    }

    const licenseUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'rider_documents/license',
        },
        (error, result) => {
          if (error) {
            return reject(new Error('License upload failed: ' + error.message));
          }
          resolve(result.secure_url);
        }
      );
      stream.end(req.files.license[0].buffer);
    });

    const insuranceUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'rider_documents/insurance',
        },
        (error, result) => {
          if (error) {
            return reject(new Error('Insurance upload failed: ' + error.message));
          }
          resolve(result.secure_url);
        }
      );
      stream.end(req.files.insurance[0].buffer);
    });

    const riderData = {
      ...req.body,
      license: licenseUpload,
      insurance: insuranceUpload,
      user: userId,
    };

    const rider = await deliveryService.createRider(riderData);

    res.status(201).json({
      message: 'Documents uploaded successfully. Account pending verification.',
      rider,
    });
  } catch (error) {
    console.error('Error in createRider:', error);
    res.status(400).json({
      message: error.message || 'Document upload failed',
      details: error.errors || {},
    });
  }
};

// Get rider by ID
const getRiderById = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await deliveryService.getRiderById(riderId);
    res.status(200).json({ rider });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get rider by user ID
const getRiderByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const rider = await deliveryService.getRiderByUserId(userId);
    res.status(200).json({ rider });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Create a new delivery
const createDelivery = async (req, res) => {
  try {
    const deliveryData = req.body;
    const delivery = await deliveryService.createDelivery(deliveryData);
    res.status(201).json({ message: 'Delivery created successfully', delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await deliveryService.getDeliveryById(deliveryId);
    res.status(200).json({ delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId, status } = req.params;
    const { earnings } = req.body;
    const validStatuses = ['in-progress', 'pick-up', 'en_route', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updatedDelivery = await deliveryService.updateDeliveryStatus(deliveryId, status, earnings);
    res.status(200).json({ message: 'Delivery status updated', updatedDelivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get pending delivery for a rider
const getPendingDelivery = async (req, res) => {
  try {
    const { riderId } = req.params;
    const delivery = await deliveryService.getPendingDeliveryByRider(riderId);
    res.status(200).json({ delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get active delivery for a rider
const getActiveDelivery = async (req, res) => {
  try {
    const { riderId } = req.params;
    const delivery = await deliveryService.getActiveDeliveryByRider(riderId);
    res.status(200).json({ delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Accept delivery
const acceptDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await deliveryService.acceptDelivery(deliveryId);
    res.status(200).json({ message: 'Delivery accepted', delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Decline delivery
const declineDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await deliveryService.declineDelivery(deliveryId);
    res.status(200).json({ message: 'Delivery declined', delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Controller function to update rider location
const updateLocation = async (req, res) => {
  const { riderId } = req.params;  // Get riderId from request params
  const { location } = req.body;  // Get location from request body

  console.log("[updateLocation] Request received:", { riderId, location }); // Debugging log

  // Validate the location
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    console.warn("[updateLocation] Invalid location data:", location); // Debugging log
    return res.status(400).json({ message: 'Invalid location data' });
  }

  // Ensure the location is in GeoJSON format
  const geoLocation = {
    type: "Point",  // Set the type to "Point"
    coordinates: location.coordinates,  // Ensure coordinates are in [longitude, latitude] format
  };

  try {
    // Find the rider by riderId and update the location field
    console.log("[updateLocation] Attempting to update rider location..."); // Debugging log

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      { location: geoLocation },  // Update location with GeoJSON format
      { new: true }   // Return the updated rider object
    );

    // If rider not found
    if (!rider) {
      console.warn("[updateLocation] Rider not found:", riderId); // Debugging log
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Respond with the updated rider data
    console.log("[updateLocation] Rider location updated successfully:", rider); // Debugging log
    res.status(200).json({ message: 'Location updated successfully', rider });
  } catch (error) {
    console.error("[updateLocation] Error updating location:", error); // Debugging log
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const getDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    const delivery = await Delivery.findOne({ orderId }).lean();
    
    if (!delivery) {
      return res.status(200).json({ 
        status: 'pending', 
        found: false,
        message: 'No delivery found for this order'
      });
    }

    res.status(200).json({ 
      status: delivery.status, 
      found: true,
      deliveryId: delivery._id,
      updatedAt: delivery.updatedAt
    });
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch delivery status',
      details: error.message 
    });
  }
};

/**
 * Stream delivery status updates via Server-Sent Events (SSE)
 */
const streamDeliveryStatus = async (req, res) => {
  const { orderId } = req.params;

  // Validate orderId format
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID format' });
  }

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
      const delivery = await Delivery.findOne({ orderId }).lean();
      const status = delivery?.status || 'pending';
      
      res.write(`data: ${JSON.stringify({
        deliveryStatus: status,
        deliveryId: delivery?._id,
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      console.error('Delivery status error:', error);
      res.write(`event: error\ndata: ${JSON.stringify({
        error: 'Failed to fetch delivery status'
      })}\n\n`);
    }
  };

  // Initial update
  await sendUpdate();

  // Set up MongoDB change stream if replica set is configured
  let changeStream;
  try {
    changeStream = Delivery.watch([{
      $match: {
        'fullDocument.orderId': orderId,
        operationType: { $in: ['insert', 'update'] }
      }
    }]);

    changeStream.on('change', async (change) => {
      await sendUpdate();
    });
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

module.exports = {
  createRider,
  getRiderById,
  getRiderByUserId,
  createDelivery,
  getDeliveryById,
  updateDeliveryStatus,
  getPendingDelivery,
  getActiveDelivery,
  acceptDelivery,
  declineDelivery,
  updateLocation,
  getDeliveryStatus,
  streamDeliveryStatus,
};
