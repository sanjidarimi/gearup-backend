import { v2 as cloudinary } from "cloudinary";
import config from ".";

cloudinary.config({
  cloud_name: config.cloud_name,
  cloud_api_key: config.cloud_api_key,
  cloud_api_secret: config.cloud_api_secret,
});

export const cloudinaryUpload = cloudinary;
