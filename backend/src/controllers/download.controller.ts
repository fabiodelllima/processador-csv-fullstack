import type { Request, Response } from "express";
import { NotFoundError } from "../errors/NotFoundError";
import { ProcessError } from "../errors/ProcessError";
import { ValidationError } from "../errors/ValidationError";
import type { HttpResponse } from "../interfaces";
import { asyncErrorHandler } from "../middlewares/errorHandler.middleware";
import { getCsvProcessingStatus } from "../services/csv.service";
import { formatDataResponse } from "../utils/format.util";

type DataResponse = ReturnType<typeof formatDataResponse>;

export const download = asyncErrorHandler((req: Request, res: Response) => {
  const { processId } = req.params;

  if (!processId) {
    throw new ValidationError("Process ID is required");
  }

  const status = getCsvProcessingStatus(processId);

  if (!status?.result) {
    throw new NotFoundError("Processed data not found");
  }

  if (status.status !== "completed") {
    throw new ProcessError("Processing not completed yet");
  }

  const response: HttpResponse<DataResponse> = {
    status: "success",
    message: "Data retrieved successfully",
    data: formatDataResponse(status.result),
  };

  res.json(response);
});
