import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import ErrorHandler from "../../middleware/error.js";
import { User } from "../../models/user/userModal.js";
import { successResponse } from "../../utils/utils.js";
import cloudinary from "../../config/cloudinary.js";
import fs from 'fs';

export const uploadFile = catchAsyncError(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorHandler("No file uploaded.", 400));
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'user_profiles',
        resource_type: 'image',
    });

    fs.unlinkSync(req.file.path);

    return successResponse(res, {
        code: 200,
        data: {
            url: result.secure_url,
            publicId: result.public_id,
        },
        message: "File uploaded successfully to Cloudinary.",
    });
});

export const downloadFile = catchAsyncError(async (req, res, next) => {
    const { publicId } = req.params;
    
    if (!publicId) {
        return next(new ErrorHandler("Public ID is required.", 400));
    }

    const url = cloudinary.url(publicId, {
        resource_type: 'image',
        secure: true
    });

    return successResponse(res, {
        code: 200,
        data: { url },
        message: "File URL retrieved successfully.",
    });
});