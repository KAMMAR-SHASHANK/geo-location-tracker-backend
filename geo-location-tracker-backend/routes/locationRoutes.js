const express = require('express');
const router = express.Router();
const Location = require('../models/location'); // Sequelize model for location
const User = require('../models/user'); // Sequelize model for user
const moment = require('moment'); // Used for handling timestamps

// new one citizen
router.get('/latest/:vehicleId', async (req, res) => {
  try {
    const location = await Location.findOne({
      where: {
        vehicleId: req.params.vehicleId,
      },
      order: [['timestamp', 'DESC']],
    });

    if (!location) {
      return res.status(404).json({
        error: 'No location found',
      });
    }

    res.json(location);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
// Test page
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Location routes working',
    timestamp: new Date()
  });
});

// Assuming you are using Sequelize for querying the database
router.post('/new_location_add', async (req, res) => {
    const { vehicleId, latitude, longitude, timestamp } = req.body;

    // Check if required fields are provided
    if (!vehicleId || !latitude || !longitude || !timestamp) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    try {
        // Insert location data into the location_histories table using Sequelize
        const newLocation = await Location.create({
            vehicleId,
            latitude,
            longitude,
            timestamp,
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'), // createdAt
            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')  // updatedAt
        });

        res.status(200).send({ message: 'Location saved successfully', data: newLocation });
    } catch (err) {
        console.error('Error saving location:', err);
        res.status(500).send({ error: 'Error saving location' });
    }
});

// Get All Locations with associated User
router.get('/locations', async (req, res) => {
    try {
        // Fetch all locations and include user information (using Sequelize associations)
        const locations = await Location.findAll({
            include: {
                model: User, // Assuming you have a User model to reference for userId
                as: 'user',
                attributes: ['vehicleId', 'vehicleType'], // Adjust attributes as needed
            },
        });

        res.status(200).json({ locations });
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
