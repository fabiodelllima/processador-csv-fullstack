import { Request, Response } from "express";
import {
  asyncErrorHandler,
  ValidationError,
} from "../middlewares/errorHandler";
import { processCsv, getCsvProcessingStatus } from "../services/csv.service";

export const uploadCsv = asyncErrorHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new ValidationError(
        "Invalid file type. Only CSV files are allowed"
      );
    }

    const processId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    processCsv(req.file.path, processId).catch((error) => {
      console.error("Background processing failed:", error);
    });

    res.status(202).json({
      message: "File uploaded successfully. Processing started",
      status: "processing",
      processId,
      fileName: req.file.filename,
      estimatedTime: "30 seconds",
    });
  }
);

export const getProcessingStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { processId } = req.params;

    if (!processId) {
      throw new ValidationError("Process ID is required");
    }

    const status = await getCsvProcessingStatus(processId);

    if (!status) {
      throw new ValidationError("Processing ID not found");
    }

    const response = {
      processId,
      status: status.status,
      ...(status.error && { error: status.error }),
      ...(status.result && {
        result: {
          totalRecords: status.result.length,
          validRecords: status.result.filter(
            (record) =>
              record.cpfCnpjValido &&
              record.contratoValido &&
              record.prestacaoValida
          ).length,
          invalidRecords: status.result.filter(
            (record) =>
              !record.cpfCnpjValido ||
              !record.contratoValido ||
              !record.prestacaoValida
          ).length,
        },
      }),
    };

    if (status.status === "failed") {
      return res.status(422).json(response);
    }

    res.json(response);
  }
);

export const downloadProcessedData = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { processId } = req.params;

    if (!processId) {
      throw new ValidationError("Process ID is required");
    }

    const status = await getCsvProcessingStatus(processId);

    if (!status || !status.result) {
      throw new ValidationError(
        "Processed data not found or processing not completed"
      );
    }

    if (status.status !== "completed") {
      throw new ValidationError("Processing not completed yet");
    }

    res.json({
      data: status.result,
      summary: {
        totalRecords: status.result.length,
        validRecords: status.result.filter(
          (record) =>
            record.cpfCnpjValido &&
            record.contratoValido &&
            record.prestacaoValida
        ).length,
        invalidRecords: status.result.filter(
          (record) =>
            !record.cpfCnpjValido ||
            !record.contratoValido ||
            !record.prestacaoValida
        ).length,
      },
    });
  }
);
