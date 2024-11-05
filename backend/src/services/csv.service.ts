import fs from "fs";
import { Parser } from "csv-parse";
import { CsvData } from "../interfaces/csv/csvData.interface";
import { ProcessedData } from "../interfaces/csv/processedData.interface";
import {
  validateDocument,
  validateContract,
  validateInstallment,
} from "./csv.validation";

const processings = new Map<
  string,
  {
    status: "completed" | "processing" | "failed";
    error?: string;
    result?: ProcessedData[];
  }
>();

const processRecord = async (record: any): Promise<ProcessedData> => {
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

  return {
    ...data,
    cpfCnpjValido: await validateDocument(data.nrCpfCnpj),
    contratoValido: await validateContract(data),
    prestacaoValida: await validateInstallment(
      data.vlTotal,
      data.nrPresta,
      data.qtPrestacoes
    ),
  };
};

const processCsv = async (filePath: string, fileId: string): Promise<void> => {
  try {
    processings.set(fileId, { status: "processing" });

    const parser = new Parser({ columns: true, skip_empty_lines: true });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(parser);

    const results: ProcessedData[] = [];

    for await (const record of parser) {
      const processedRecord = await processRecord(record);
      results.push(processedRecord);
    }

    processings.set(fileId, { status: "completed", result: results });

    await fs.promises.unlink(filePath);
  } catch (error) {
    processings.set(fileId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
};

const getProcessingStatus = (fileId: string) => {
  return (
    processings.get(fileId) || {
      status: "Failed",
      error: "Processing not found",
    }
  );
};

export { processCsv, getProcessingStatus };
