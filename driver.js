const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify driver
const verifyDriver = (req, res, next) => {
    const token = req.session.token;
    if (!token) return res.status(401).send('Access denied');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'driver') {
            req.user = decoded;
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    } catch (ex) {
        res.status(400).send('Invalid token');
    }
};

// Driver location update
router.post('/location', verifyDriver, (req, res) => {
    const location = req.body.location;
    // Emit location to all connected clients
    req.io.emit('locationUpdate', location);
    res.send('Location updated');
});

module.exports = router;
