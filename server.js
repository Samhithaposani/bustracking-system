require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Socket.io middleware
app.use((req, res, next) => {
    req.io = io;
    next();
});

// MongoDB connection without deprecated options
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1); // Exit the application on failure
    });

let busLocation = null;

io.on('connection', socket => {
    console.log('New client connected');

    // Send current location to new connections
    if (busLocation) {
        socket.emit('locationUpdate', busLocation);
    }

    socket.on('locationUpdate', (location) => {
        busLocation = location;
        io.emit('locationUpdate', location);
        console.log('Bus location updated:', location);
    });

    socket.on('deleteLocation', () => {
        busLocation = null;
        io.emit('locationDeleted');
        console.log('Bus location deleted');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/student', require('./routes/student'));

// Route to serve student.html
app.get('/student', (req, res) => {
    res.sendFile(__dirname + '/public/student.html');
});

// Route to send Google Maps API key
app.get('/api/key', (req, res) => {
    res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Bus Tracking System!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
