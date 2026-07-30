import { v2  } from "cloudinary";
import streamifier from "streamifier";

import { IUploadedImage, IUploadOptions } from "./image.interface";
import cloudinary from "../../config/cloudinary";

const uploadSingleImage = (
  file: Express.Multer.File,
  options: IUploadOptions,
): Promise<IUploadedImage> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Image upload failed."));
        }

        resolve({
          url: result.secure_url,
          storageKey: result.public_id,
          width: result.width,
          height: result.height,
          fileSize: result.bytes,
          mimeType: file.mimetype,
        });
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

const uploadMultipleImages = async (
  files: Express.Multer.File[],
  options: IUploadOptions,
): Promise<IUploadedImage[]> => {
  return Promise.all(
    files.map((file) => uploadSingleImage(file, options)),
  );
};

const deleteImage = async (storageKey: string) => {
  const result = await cloudinary.uploader.destroy(storageKey);

  if (result.result !== "ok") {
    throw new Error("Failed to delete image from Cloudinary.");
  }

  return result;
};

const deleteMultipleImages = async (storageKeys: string[]) => {
  await Promise.all(storageKeys.map(deleteImage));
};

export const ImageService = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
};