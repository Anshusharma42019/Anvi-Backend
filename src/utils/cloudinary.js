import path from "path";
import cloudinary from "cloudinary";
import fs from "fs";

// Configure Cloudinary using environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder = "anvi-tiles") => {
  try {
    const ext = path.extname(filePath).toLowerCase();

    const isRaw = [".pdf", ".doc", ".docx"].includes(ext);
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder,
      resource_type: isRaw ? "raw" : "auto", 
    });
    // remove temp file after upload
    fs.unlink(filePath, err => {
      if (err) console.warn('Temp file cleanup error:', err);
    });
    return result;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
};

export const deleteFromCloudinary = async (public_id) => {
  try {
    await cloudinary.v2.uploader.destroy(public_id);
  } catch (error) {
    console.error(`Cloudinary delete error: ${error.message}`);
    throw error;
  }
};