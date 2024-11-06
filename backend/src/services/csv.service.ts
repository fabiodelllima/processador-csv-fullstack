import fs from "fs";
import { Parser } from "csv-parse";
import { CsvData } from "../interfaces/csv/csvData.interface";
import { ProcessedData } from "../interfaces/csv/processedData.interface";
import {
  validateDocument,
  validateContract,
  validateInstallment,
} from "./csv.validation";
import { FileProcessingError } from "../middlewares/errorHandler";

const processings = new Map<
  string,
  {
    status: "completed" | "processing" | "failed";
    error?: string;
    result?: ProcessedData[];
  }
>();

const processRecord = async (record: any): Promise<ProcessedData> => {
  try {
    const data: CsvData = {
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

    const documentValid = await validateDocument(data.nrCpfCnpj);
    const contractValid = await validateContract(data);
    const installmentValid = await validateInstallment(
      data.vlTotal,
      data.vlPresta,
      data.qtPrestacoes
    );

    return {
      ...data,
      cpfCnpjValido: documentValid,
      contratoValido: contractValid,
      prestacaoValida: installmentValid,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new FileProcessingError(
        `Error processing record: ${error.message}`
      );
    }
    throw new FileProcessingError("Unknown error processing record");
  }
};

const processCsv = async (filePath: string, fileId: string): Promise<void> => {
  try {
    processings.set(fileId, { status: "processing" });

    const parser = new Parser({ columns: true, skip_empty_lines: true });
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(parser);

    const results: ProcessedData[] = [];

    let lineNumber = 0;
    for await (const record of parser) {
      lineNumber++;
      try {
        const processedRecord = await processRecord(record);
        results.push(processedRecord);
      } catch (error) {
        throw new FileProcessingError(
          `Error on line ${lineNumber}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    processings.set(fileId, { status: "completed", result: results });

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

const getCsvProcessingStatus = (fileId: string) => {
  return (
    processings.get(fileId) || {
      status: "failed",
      error: "Processing not found",
    }
  );
};

export { processCsv, getCsvProcessingStatus };
