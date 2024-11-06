import multer from "multer";
import { Request } from "express";
import { env } from "./env.config";
import { ValidationError } from "../errors/ValidationError";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (env.upload.folder) {
      cb(null, env.upload.folder);
    } else {
      cb(new Error("Upload folder not found"), "");
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    cb(null, `${timestamp}-${randomString}-${file.originalname}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    !env.upload.allowedMimetypes.includes(
      file.mimetype as "text/csv" | "application/vnd.ms-excel"
    )
  ) {
    cb(new ValidationError("Invalid file type. Only CSV files are allowed."));
    return;
  }
  cb(null, true);
};

export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxSize,
  },
});
