import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary = async (localFilePath) => {
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // File has been uploaded successfully
        //console.log('File has been uploaded successfully', response.url);

        // Remove the locally saved temporary file after successful upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        // Remove the locally saved temporary file as upload operation got failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary upload failed:", error);
        return null;
    }
};

export { uploadonCloudinary };