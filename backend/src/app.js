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
app.use('/favicon_io', express.static('../public/favicon_io'));

// TODO: Add routes
app.use('/api', routes);

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.redirect('/favicon_io/favicon.ico');
});

// Handle Chrome DevTools requests gracefully
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end(); // No content for Chrome DevTools
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;