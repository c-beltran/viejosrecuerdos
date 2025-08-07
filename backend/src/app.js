const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files
app.use('/public', express.static('public'));

// TODO: Add routes
app.use('/api', routes);


module.exports = app;