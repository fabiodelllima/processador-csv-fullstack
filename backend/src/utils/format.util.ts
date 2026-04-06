import type { RecordData, ResultData } from "../interfaces";
import type { SuccessData } from "../interfaces/csv/success.interface";

export const formatProcessingResponse = (status: ResultData, processId: string) => {
  if (!status.result) {
    return {
      processId,
      status: status.status,
      ...(status.error && { error: status.error }),
    };
  }

  return {
    processId,
    status: status.status,
    result: {
      totalRecords: status.result.data.length,
      validRecords: countValidRecords(status.result.data),
      invalidRecords: countInvalidRecords(status.result.data),
      processingTime: status.result.summary.processingTime,
      totalValue: status.result.summary.totalValue,
      errors: status.result.errors,
      successes: status.result.successes as SuccessData[],
    },
  } as const;
};

export const formatDataResponse = (result: NonNullable<ResultData["result"]>) => {
  return {
    data: result.data,
    summary: {
      totalRecords: result.data.length,
      validRecords: countValidRecords(result.data),
      invalidRecords: countInvalidRecords(result.data),
      processingTime: result.summary.processingTime,
      totalValue: result.summary.totalValue,
    },
    successes: result.successes as SuccessData[],
  } as const;
};

const countValidRecords = (records: RecordData[]): number =>
  records.filter(
    (record) => record.cpfCnpjValido && record.contratoValido && record.prestacaoValida,
  ).length;

const countInvalidRecords = (records: RecordData[]): number =>
  records.filter(
    (record) => !record.cpfCnpjValido || !record.contratoValido || !record.prestacaoValida,
  ).length;

export const parseDecimalNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  const str = String(value);
  if (str.includes(",")) {
    return Number(str.replace(/\./g, "").replace(",", "."));
  }
  return Number(str.replace(/[^\d.-]/g, ""));
};

// "1.234" => 1234
export const parseWholeNumber = (value: string | number): number => {
  if (typeof value === "number") return Math.floor(value);
  return Number(String(value).replace(/\D/g, ""));
};
