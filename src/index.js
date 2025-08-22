import {app} from "./app.js";
import connectDB from "./db/index.js";
import 'dotenv/config.js';

// Connect to MongoDB and start the server
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB!!:", error);
    });