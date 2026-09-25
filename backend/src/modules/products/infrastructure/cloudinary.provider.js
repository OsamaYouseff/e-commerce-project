const cloudinary = require("cloudinary").v2;
const { env } = require("../../../config/env");

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadBase64Image = async (base64String) => {
  if (!base64String.startsWith("data:image")) {
    throw new Error("Invalid image data");
  }
  return cloudinary.uploader.upload(base64String, { resource_type: "auto" });
};

const extractPublicId = (url) => (url ? url.split("/").pop().split(".")[0] : null);

const destroyImage = async (publicId) => cloudinary.uploader.destroy(publicId);

module.exports = { uploadBase64Image, extractPublicId, destroyImage };