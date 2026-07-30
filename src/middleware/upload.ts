import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, callback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error("Only JPEG, PNG, WEBP and AVIF images are allowed."),
    );
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 5,
  },
});
