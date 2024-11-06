import fs from "fs";
import { Parser } from "csv-parse";
import { ErrorData, FileData, RecordData, ResultData } from "../interfaces";
import { validateDocument } from "./validations/document.validation";
import { validateContract } from "./validations/contract.validation";
import { validateInstallment } from "./validations/installment.validation";

const processings = new Map<string, ResultData>();

const processRecord = async (
  record: any,
  lineNumber: number
): Promise<[RecordData | null, ErrorData[]]> => {
  const errors: ErrorData[] = [];

  try {
    const data: FileData = {
      ...record,
      qtPrestacoes: Number(record.qtPrestacoes),
      vlTotal: Number(record.vlTotal),
      nrPresta: Number(record.nrPresta),
      vlPresta: Number(record.vlPresta),
      vlMora: Number(record.vlMora),
      vlMulta: Number(record.vlMulta),
      vlOutAcr: Number(record.vlOutAcr),
      vlIof: Number(record.vlIof),
      vlDescon: Number(record.vlDescon),
      vlAtual: Number(record.vlAtual),
    };

    let cpfCnpjValido = false;
    let contratoValido = false;
    let prestacaoValida = false;

    try {
      cpfCnpjValido = validateDocument(data.nrCpfCnpj);
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
    } catch (error) {
      errors.push({
        line: lineNumber,
        field: "contract",
        value: data.nrContrato,
        error: error instanceof Error ? error.message : "Invalid contract",
      });
    }

    try {
      prestacaoValida = validateInstallment(
        data.vlTotal,
        data.vlPresta,
        data.qtPrestacoes
      );
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

    return [processedData, errors];
  } catch (error) {
    errors.push({
      line: lineNumber,
      field: "record",
      value: JSON.stringify(record),
      error: error instanceof Error ? error.message : "Error processing record",
    });
    return [null, errors];
  }
};

export const processCsv = async (
  filePath: string,
  fileId: string
): Promise<void> => {
  const startTime = new Date();

  try {
    processings.set(fileId, {
      status: "processing",
      result: {
        data: [],
        errors: [],
        summary: {
          totalRecords: 0,
          validRecords: 0,
          invalidRecords: 0,
          processingTime: "0s",
          totalValue: 0,
          startTime,
          endTime: startTime,
        },
      },
    });

    const parser = new Parser({ columns: true, skip_empty_lines: true });
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(parser);

    const processedData: RecordData[] = [];
    const allErrors: ErrorData[] = [];

    let lineNumber = 0;
    for await (const record of parser) {
      lineNumber++;
      const [data, errors] = await processRecord(record, lineNumber);

      if (data) {
        processedData.push(data);
      }
      allErrors.push(...errors);
    }

    const endTime = new Date();
    const processingTime = `${
      (endTime.getTime() - startTime.getTime()) / 1000
    }s`;

    const validRecords = processedData.filter(
      (record) =>
        record.cpfCnpjValido && record.contratoValido && record.prestacaoValida
    );

    processings.set(fileId, {
      status: "completed",
      result: {
        data: processedData,
        errors: allErrors,
        summary: {
          totalRecords: processedData.length,
          validRecords: validRecords.length,
          invalidRecords: processedData.length - validRecords.length,
          processingTime,
          totalValue: validRecords.reduce(
            (sum, record) => sum + record.vlTotal,
            0
          ),
          startTime,
          endTime,
        },
      },
    });

    await fs.promises.unlink(filePath);
  } catch (error) {
    processings.set(fileId, {
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error processing file",
    });

    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkError) {
      console.error("Error deleting file:", unlinkError);
    }
  }
};

export const getCsvProcessingStatus = (
  fileId: string
): ResultData | undefined => {
  return processings.get(fileId);
};
