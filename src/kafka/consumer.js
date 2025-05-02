const { Kafka } = require('kafkajs');
const Delivery = require('../models/Delivery');
const Rider = require('../models/Rider');
const axios = require('axios');

const kafka = new Kafka({
  clientId: 'delivery-service',
  brokers: ['kafka:9092'],
  retry: {
    initialRetryTime: 1000,
    retries: 20,
    factor: 2,
    maxRetryTime: 30000,
  },
});

const consumer = kafka.consumer({ groupId: 'delivery-group' });
let isConsumerRunning = false;
let isConsumerStarting = false;

const generateOrderCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const startConsumer = async () => {
  if (isConsumerRunning) {
    console.log('Consumer is already running, skipping startConsumer');
    return;
  }
  if (isConsumerStarting) {
    console.log('Consumer is starting, skipping concurrent startConsumer');
    return;
  }

  isConsumerStarting = true;
  try {
    console.log('Attempting to connect to Kafka consumer...');
    await consumer.connect();
    console.log('Connected to Kafka consumer');

    await consumer.subscribe({ topic: 'order-ready', fromBeginning: true });
    console.log('Subscribed to order-ready topic');

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const orderData = JSON.parse(message.value.toString());
          console.log(`Processing order-ready event for order: ${orderData.data._id}`);
          
          // Fetch restaurant details
          const restaurantResponse = await axios.get(
            `http://restaurant-service:5001/api/restaurants/by-id/${orderData.data.restaurant}`,
            {
              headers: { Authorization: `Bearer ${orderData.token || ''}` },
            }
          ).catch((error) => {
            console.error('Restaurant fetch error:', error.response?.data || error.message);
            const fallbackCoords = Array.isArray(orderData.data.deliverylocation.coordinates) 
              ? orderData.data.deliverylocation.coordinates
              : [-122.4194, 37.7749]; // San Francisco
            return {
              data: {
                name: 'Unknown Restaurant',
                address: 'Unknown',
                location: { type: 'Point', coordinates: fallbackCoords },
                phone: 'Unknown',
              },
            };
          });

          // Ensure valid location
          const restaurantLocation = restaurantResponse.data.location && Array.isArray(restaurantResponse.data.location.coordinates)
            ? restaurantResponse.data.location
            : { type: 'Point', coordinates: [-122.4194, 37.7749] };

          // Ensure valid customer location
          const customerLocation = orderData.data.deliverylocation && Array.isArray(orderData.data.deliverylocation.coordinates)
            ? orderData.data.deliverylocation
            : { type: 'Point', coordinates: [-122.4194, 37.7749] }; 

          // Find the nearest available rider
          const nearestRider = await Rider.findOne({
            verificationStatus: 'approved',
            isActive: true,
            location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: restaurantLocation.coordinates,
                },
                $maxDistance: 50000, 
              },
            },
          });

          if (!nearestRider) {
            console.log('No available riders found near restaurant');
            return;
          }

          // Create delivery record
          const delivery = new Delivery({
            orderId: orderData.data._id,
            rider: nearestRider._id,
            status: 'assigned',
            restaurant: {
              name: restaurantResponse.data.name,
              address: restaurantResponse.data.address,
              location: restaurantLocation,
              phone: restaurantResponse.data.phone || 'Unknown',
            },
            customer: {
              name: orderData.data.customer || 'Unknown Customer',
              address: orderData.data.deliveryAddress || 'Unknown',
              location: customerLocation,
              phone: orderData.data.phone || 'Unknown',
            },
            orderCode: generateOrderCode(),
            items: orderData.data.items || [],
            totalAmount: orderData.data.totalAmount || 0,
            specialInstructions: orderData.data.specialInstructions || '',
            paymentMethod: orderData.data.paymentMethod || 'unknown',
            deliveryFee: 5,
            deliveryAddress: orderData.data.deliveryAddress || 'Unknown',
            deliveryTime: orderData.data.deliveryTime || new Date(Date.now() + 30 * 60 * 1000),
          });

          await delivery.save();
          console.log(`Delivery assigned to rider ${nearestRider._id} for order ${orderData.data._id}`);
        } catch (error) {
          console.error(`Error processing order-ready event: ${error.message}`, error.stack);
        }
      },
    });

    isConsumerRunning = true;
    isConsumerStarting = false;
    console.log('Kafka consumer fully started');
  } catch (error) {
    isConsumerStarting = false;
    console.error(`Failed to start Kafka consumer: ${error.message}`, error);
    if (!isConsumerRunning) {
      console.log('Retrying consumer start in 5 seconds...');
      setTimeout(startConsumer, 5000);
    }
  }
};

process.on('SIGINT', async () => {
  console.log('Disconnecting Kafka consumer...');
  isConsumerRunning = false;
  isConsumerStarting = false;
  await consumer.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Disconnecting Kafka consumer...');
  isConsumerRunning = false;
  isConsumerStarting = false;
  await consumer.disconnect();
  process.exit(0);
});

if (!isConsumerRunning && !isConsumerStarting) {
  startConsumer();
}

module.exports = { startConsumer };