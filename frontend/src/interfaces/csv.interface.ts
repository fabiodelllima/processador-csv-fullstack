export interface RecordData {
  nmClient: string;
  nrCpfCnpj: string;
  nrContrato: string;
  vlTotal: number;
  cpfCnpjValido: boolean;
  contratoValido: boolean;
  prestacaoValida: boolean;
}

export interface Summary {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  processingTime: string;
  totalValue: number;
  startTime: Date;
  endTime: Date;
}

export interface SuccessData {
  line: number;
  field: string;
  value: string;
  message: string;
}

export interface ErrorData {
  line: number;
  field: string;
  value: string;
  error: string;
}

export interface UploadResponse {
  status: string;
  message: string;
  data: {
    processId: string;
    fileName: string;
    mimeType: string;
  };
}

export interface StatusResponse {
  status: string;
  message: string;
  data: {
    processId: string;
    status: "processing" | "completed" | "failed";
  };
}

export interface ResultData {
  status: string;
  message: string;
  data: {
    data: RecordData[];
    summary: Summary;
    successes: SuccessData[];
    errors: ErrorData[];
  };
}
