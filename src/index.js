const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Delivery Service is Running...');
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Delivery Service running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
