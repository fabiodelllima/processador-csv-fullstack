import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError } from "../errors/AppError";
import { HttpResponse } from "../interfaces";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("[Error]:", {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });

  if (error instanceof AppError) {
    const response: HttpResponse = {
      status: "error",
      message: error.message,
    };
    return res.status(error.statusCode).json(response);
  }

  if (error instanceof MulterError) {
    const response: HttpResponse = {
      status: "error",
      message: (() => {
        switch (error.code) {
          case "LIMIT_FILE_SIZE":
            return "File is too large";
          case "LIMIT_UNEXPECTED_FILE":
            return "Unexpected field in upload";
          default:
            return "Error uploading file";
        }
      })(),
    };
    return res.status(400).json(response);
  }

  const response: HttpResponse = {
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  };

  return res.status(500).json(response);
};

export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
