import path from "node:path";
import type { Request } from "express";
import multer from "multer";
import { ValidationError } from "../errors/ValidationError";
import { env } from "./env.config";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (env.upload.folder) {
      cb(null, env.upload.folder);
    } else {
      cb(new Error("Upload folder not found"), "");
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${randomString}-${sanitizedName}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (
    !env.upload.allowedMimetypes.includes(file.mimetype as "text/csv" | "application/vnd.ms-excel")
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
