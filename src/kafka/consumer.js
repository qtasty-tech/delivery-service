// delivery-service/src/kafka/consumer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'delivery-service',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'delivery-group' });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-ready', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const orderData = JSON.parse(message.value.toString());
      console.log(`Order ready for delivery: ${orderData._id}`);
      // Process delivery here
    },
  });
};

startConsumer().catch(console.error);
