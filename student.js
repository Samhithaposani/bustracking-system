const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // Ensure you have a Student model

// Route to get student details
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).send('Student not found');
        res.send(student);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Route to update student location
router.put('/:id/location', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).send('Student not found');

        student.location = req.body.location; // Assuming the body contains location data
        await student.save();
        res.send(student);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
