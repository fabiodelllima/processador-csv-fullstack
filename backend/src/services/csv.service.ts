import fs from "node:fs";
import path from "node:path";
import { Parser } from "csv-parse";
import { env } from "../config/env.config";
import type { ErrorData, FileData, RecordData } from "../interfaces";
import type { SuccessData } from "../interfaces/csv/success.interface";
import type { ResultData } from "../interfaces/csv/result.interface";
import { parseDecimalNumber, parseWholeNumber } from "../utils/format.util";
import { validateContract } from "./validations/contract.validation";
import { validateDocument } from "./validations/document.validation";
import { validateInstallment } from "./validations/installment.validation";
import * as repo from "../database/repository";

const toSafeUploadPath = (filePath: string): string => {
  const fileName = path.basename(filePath);
  return path.join(path.resolve(env.upload.folder), fileName);
};

const processRecord = (
  record: Record<string, string>,
  lineNumber: number,
): [RecordData | null, ErrorData[], SuccessData[]] => {
  const errors: ErrorData[] = [];
  const successes: SuccessData[] = [];

  try {
    const data: FileData = {
      nrInst: String(record.nrInst),
      nrAgencia: String(record.nrAgencia),
      cdClient: String(record.cdClient),
      nmClient: String(record.nmClient),
      nrCpfCnpj: String(record.nrCpfCnpj),
      nrContrato: String(record.nrContrato),
      dtContrato: String(record.dtContrato),
      cdProduto: String(record.cdProduto),
      dsProduto: String(record.dsProduto),
      cdCarteira: String(record.cdCarteira),
      dsCarteira: String(record.dsCarteira),
      nrProposta: String(record.nrProposta),
      tpPresta: String(record.tpPresta),
      nrSeqPre: String(record.nrSeqPre),
      dtVctPre: String(record.dtVctPre),
      idSituac: String(record.idSituac),
      idSitVen: String(record.idSitVen),
      qtPrestacoes: parseWholeNumber(record.qtPrestacoes),
      nrPresta: parseWholeNumber(record.nrPresta),
      vlTotal: parseDecimalNumber(record.vlTotal),
      vlPresta: parseDecimalNumber(record.vlPresta),
      vlMora: parseDecimalNumber(record.vlMora),
      vlMulta: parseDecimalNumber(record.vlMulta),
      vlOutAcr: parseDecimalNumber(record.vlOutAcr),
      vlIof: parseDecimalNumber(record.vlIof),
      vlDescon: parseDecimalNumber(record.vlDescon),
      vlAtual: parseDecimalNumber(record.vlAtual),
    };

    let cpfCnpjValido = false;
    let contratoValido = false;
    let prestacaoValida = false;

    try {
      cpfCnpjValido = validateDocument(data.nrCpfCnpj);
      successes.push({
        line: lineNumber,
        field: "nrCpfCnpj",
        value: data.nrCpfCnpj,
        message: "Document successfully validated",
      });
    } catch (error) {
      errors.push({
        line: lineNumber,
        field: "nrCpfCnpj",
        value: data.nrCpfCnpj,
        error: error instanceof Error ? error.message : "Invalid document",
      });
    }

    try {
      contratoValido = validateContract(data);
      successes.push({
        line: lineNumber,
        field: "contract",
        value: data.nrContrato,
        message: "Contract successfully validated",
      });
    } catch (error) {
      errors.push({
        line: lineNumber,
        field: "contract",
        value: data.nrContrato,
        error: error instanceof Error ? error.message : "Invalid contract",
      });
    }

    try {
      prestacaoValida = validateInstallment(data.vlTotal, data.vlPresta, data.qtPrestacoes);
      successes.push({
        line: lineNumber,
        field: "installment",
        value: String(data.vlPresta),
        message: "Installment successfully validated",
      });
    } catch (error) {
      errors.push({
        line: lineNumber,
        field: "installment",
        value: String(data.vlPresta),
        error: error instanceof Error ? error.message : "Invalid installment",
      });
    }

    const processedData: RecordData = {
      ...data,
      cpfCnpjValido,
      contratoValido,
      prestacaoValida,
    };

    return [processedData, errors, successes];
  } catch (error) {
    errors.push({
      line: lineNumber,
      field: "record",
      value: JSON.stringify(record),
      error: error instanceof Error ? error.message : "Error processing record",
    });

    return [null, errors, []];
  }
};

export const processCsv = async (filePath: string, fileId: string): Promise<void> => {
  const startTime = new Date();
  const safePath = toSafeUploadPath(filePath);

  try {
    await repo.createProcessing(fileId);

    const parser = new Parser({
      columns: true,
      skip_empty_lines: true,
      from_line: 1,
      trim: true,
    });

    const processedData: RecordData[] = [];
    const allErrors: ErrorData[] = [];
    const allSuccesses: SuccessData[] = [];
    let lineNumber = 0;

    await new Promise<void>((resolve, reject) => {
      const fileStream = fs.createReadStream(safePath);

      parser.on("readable", () => {
        let record: Record<string, string> | null = parser.read();
        while (record !== null) {
          lineNumber++;
          const [data, errors, successes] = processRecord(record, lineNumber);
          if (data) {
            processedData.push(data);
          }
          allErrors.push(...errors);
          allSuccesses.push(...successes);
          record = parser.read();
        }
      });

      parser.on("error", (error) => {
        reject(error);
      });

      parser.on("end", () => {
        resolve();
      });

      fileStream.pipe(parser);
    });

    const endTime = new Date();
    const processingTime = `${(endTime.getTime() - startTime.getTime()) / 1000}s`;

    const validRecords = processedData.filter(
      (record) => record.cpfCnpjValido && record.contratoValido && record.prestacaoValida,
    );

    await repo.insertRecords(fileId, processedData);
    await repo.insertErrors(fileId, allErrors);
    await repo.insertSuccesses(fileId, allSuccesses);
    await repo.completeProcessing(fileId, {
      totalRecords: processedData.length,
      validRecords: validRecords.length,
      invalidRecords: processedData.length - validRecords.length,
      processingTime,
      totalValue: validRecords.reduce((sum, record) => sum + record.vlTotal, 0),
    });

    await fs.promises.unlink(safePath);
  } catch (error) {
    await repo.failProcessing(
      fileId,
      error instanceof Error ? error.message : "Unknown error processing file",
    );

    try {
      await fs.promises.unlink(safePath);
    } catch {
      // File may not exist if error occurred before processing
    }
  }
};

export const getCsvProcessingStatus = async (fileId: string): Promise<ResultData | null> => {
  const processing = await repo.getProcessingStatus(fileId);
  if (!processing) return null;

  if (processing.status === "failed") {
    return {
      status: "failed",
      error: processing.error,
    };
  }

  if (processing.status === "processing") {
    return {
      status: "processing",
    };
  }

  const records = await repo.getProcessingRecords(fileId);
  const errors = await repo.getProcessingErrors(fileId);
  const successes = await repo.getProcessingSuccesses(fileId);

  return {
    status: "completed",
    result: {
      data: records,
      errors,
      successes,
      summary: {
        totalRecords: processing.total_records,
        validRecords: processing.valid_records,
        invalidRecords: processing.invalid_records,
        processingTime: processing.processing_time,
        totalValue: Number(processing.total_value),
        startTime: processing.start_time,
        endTime: processing.end_time,
      },
    },
  };
};
