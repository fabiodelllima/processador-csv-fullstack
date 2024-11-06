import { ValidationError } from "../../errors/ValidationError";

export const validateFileUpload = async (
  file: Express.Multer.File
): Promise<string> => {
  const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError("Invalid file type. Only CSV files are allowed");
  }

  return generateProcessId();
};

const generateProcessId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};
