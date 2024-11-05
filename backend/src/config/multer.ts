import multer from "multer";
import { Request } from "express";
import { env } from "./env";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (env.upload.folder) {
      cb(null, env.upload.folder);
    } else {
      cb(new Error("Upload folder not found"), "");
    }
  },
  filename: (req, file, cb) => {
    const fileId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${fileId}-${file.originalname}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    env.upload.allowedMimetypes.includes(
      file.mimetype as "text/csv" | "application/vnd.ms-excel"
    )
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only CSV files are allowed."));
  }
};

export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxSize,
  },
});
