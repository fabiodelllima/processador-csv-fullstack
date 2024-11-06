import { Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares/errorHandler.middleware";
import { ValidationError } from "../errors/ValidationError";
import { HttpResponse, UploadData } from "../interfaces";
import { processCsv } from "../services/csv.service";
import { validateFileUpload } from "../services/validations/file.validation";

export const upload = asyncErrorHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError("No file uploaded");
  }

  const processId = await validateFileUpload(req.file);

  processCsv(req.file.path, processId).catch((error) => {
    console.error("Background processing failed:", error);
  });

  const response: HttpResponse<UploadData> = {
    status: "processing",
    message: "File upload successful, processing started",
    data: {
      processId,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    },
  };

  res.status(202).json(response);
});
