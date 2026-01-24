require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Salon E-Commerce API is running...');
});

// Import Routes
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/v1/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
