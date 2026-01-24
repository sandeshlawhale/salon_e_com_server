import mongoose from 'mongoose';

let isConnected = false; // Track connection status

const connectDB = async () => {
    console.log("process.env.MONGO_URI ===>>>", process.env.MONGO_URI)
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "salon_e_com",
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('Database connection error:', err.message);
        // process.exit(1);
    }
};

export default connectDB;
