import { RecordData, ResultData } from "../interfaces";

export const formatProcessingResponse = (
  status: ResultData,
  processId: string
) => {
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
    },
  } as const;
};

export const formatDataResponse = (
  result: NonNullable<ResultData["result"]>
) => {
  return {
    data: result.data,
    summary: {
      totalRecords: result.data.length,
      validRecords: countValidRecords(result.data),
      invalidRecords: countInvalidRecords(result.data),
      processingTime: result.summary.processingTime,
      totalValue: result.summary.totalValue,
    },
  } as const;
};

const countValidRecords = (records: RecordData[]): number =>
  records.filter(
    (record) =>
      record.cpfCnpjValido && record.contratoValido && record.prestacaoValida
  ).length;

const countInvalidRecords = (records: RecordData[]): number =>
  records.filter(
    (record) =>
      !record.cpfCnpjValido || !record.contratoValido || !record.prestacaoValida
  ).length;
