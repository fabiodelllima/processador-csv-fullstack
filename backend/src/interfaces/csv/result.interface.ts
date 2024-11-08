import { ErrorData } from "./error.interface";
import { RecordData } from "./record.interface";
import { SuccessData } from "./success.interface";

export type ProcessingStatus = "processing" | "completed" | "failed";

export interface ResultData {
  status: ProcessingStatus;
  error?: string;
  result?: {
    data: RecordData[];
    errors: ErrorData[];
    successes: SuccessData[];
    summary: {
      totalRecords: number;
      validRecords: number;
      invalidRecords: number;
      processingTime: string;
      totalValue: number;
      startTime: Date;
      endTime: Date;
    };
  };
}
