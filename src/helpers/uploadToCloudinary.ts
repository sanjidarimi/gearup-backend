import { UploadApiResponse } from "cloudinary";

import streamifier from "streamifier";
import { cloudinaryUpload } from "../config/cloudinary.config";

export const uploadToCloudinary = async (
  file: Express.Multer.File,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryUpload.uploader.upload_stream(
      { folder: "gearup-products" },
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(error);
        }
        if (result) {
          resolve(result);
        } else {
          return reject(
            new Error("Cloudinary upload failed: No response result."),
          );
        }
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};
