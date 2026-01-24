import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import v1Routes from './v1/v1.routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// API Routes
app.use('/api/v1', v1Routes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Salon E-Commerce API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
