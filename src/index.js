import express from "express";
import connectDB from "./db/index.js";
import 'dotenv/config.js';

const app = express();
connectDB();

/*(async() => {
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
        app.on("error", (error) => {
            console.error("Error connecting to MongoDB:", error);
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }
    catch{
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
})()*/