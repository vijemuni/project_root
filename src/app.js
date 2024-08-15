const express = require('express');
const path = require('path');
const reviewRoutes = require('./routes/reviews');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/reviews', reviewRoutes);

module.exports = app;