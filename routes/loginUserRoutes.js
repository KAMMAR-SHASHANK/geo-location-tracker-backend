const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');

// Login User
router.post('/user-login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('LOGIN ATTEMPT:', username);

        if (!username || !password) {
            console.log('MISSING FIELDS');
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = await User.findOne({
            where: { username },
            attributes: ['username', 'vehicleId', 'vehicleType', 'password']
        });

        console.log('USER FOUND:', !!user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('HASH IN DB:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);

        console.log('PASSWORD MATCH:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('LOGIN SUCCESS:', username);

        res.status(200).json({
            message: 'Login successful',
            username: user.username,
            vehicleId: user.vehicleId,
            vehicleType: user.vehicleType
        });

    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;