import { randomUUID } from "node:crypto";
import path from "node:path";

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../../config/cloudinary.js";

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", new Set([".jpg", ".jpeg"])],
  ["image/png", new Set([".png"])],
  ["image/webp", new Set([".webp"])],
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "photo-cards",
    public_id: () => randomUUID(),
  },
});

function imageFileFilter(req, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ALLOWED_IMAGE_TYPES.get(file.mimetype);

  if (!allowedExtensions?.has(extension)) {
    const error = new Error("JPEG, PNG, WEBP 이미지만 업로드할 수 있습니다.");

    error.status = 400;
    error.code = "INVALID_IMAGE_TYPE";

    return callback(error);
  }

  return callback(null, true);
}

const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
});

const uploadSingleImage = imageUpload.single("image");

export function uploadImage(req, res, next) {
  uploadSingleImage(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      const uploadError = new Error(
        "이미지 파일은 최대 5MB까지 업로드할 수 있습니다.",
      );

      uploadError.status = 400;
      uploadError.code = "IMAGE_FILE_TOO_LARGE";

      return next(uploadError);
    }

    return next(error);
  });
}
