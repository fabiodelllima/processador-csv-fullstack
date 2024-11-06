import { Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares/errorHandler.middleware";
import { ValidationError } from "../errors/ValidationError";
import { NotFoundError } from "../errors/NotFoundError";
import { getCsvProcessingStatus } from "../services/csv.service";
import { formatProcessingResponse } from "../utils/format.util";
import { HttpResponse, ResultData } from "../interfaces";

type ProcessingResponse = ReturnType<typeof formatProcessingResponse>;

export const getStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { processId } = req.params;

    if (!processId) {
      throw new ValidationError("Process ID is required");
    }

    const status = await getCsvProcessingStatus(processId);

    if (!status) {
      throw new NotFoundError("Processing ID not found");
    }

    const response: HttpResponse<ProcessingResponse> = {
      status:
        status.status === "failed"
          ? "error"
          : status.status === "completed"
          ? "success"
          : "processing",
      message:
        status.status === "failed"
          ? "Processing failed"
          : "Processing status retrieved successfully",
      data: formatProcessingResponse(status, processId),
    };

    if (status.status === "failed") {
      return res.status(422).json(response);
    }

    res.json(response);
  }
);
