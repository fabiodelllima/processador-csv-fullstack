import * as fs from "fs";
import { ValidationError } from "../../errors/ValidationError";

const REQUIRED_COLUMNS = [
  "nrInst",
  "nrAgencia",
  "cdClient",
  "nmClient",
  "nrCpfCnpj",
  "nrContrato",
  "dtContrato",
  "qtPrestacoes",
  "vlTotal",
  "cdProduto",
  "dsProduto",
  "cdCarteira",
  "dsCarteira",
  "nrProposta",
  "nrPresta",
  "tpPresta",
  "nrSeqPre",
  "dtVctPre",
  "vlPresta",
  "vlMora",
  "vlMulta",
  "vlOutAcr",
  "vlIof",
  "vlDescon",
  "vlAtual",
  "idSituac",
  "idSitVen",
];

const validateFileStructure = async (headers: string[]): Promise<void> => {
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !headers.includes(column)
  );

  if (missingColumns.length > 0) {
    throw new ValidationError(
      `Missing required columns: ${missingColumns.join(", ")}`
    );
  }
};

const validateFileContent = (file: Express.Multer.File): void => {
  if (!file.size) {
    throw new ValidationError("File is empty");
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new ValidationError("File size exceeds 10MB limit");
  }

  if (!file.mimetype.includes("csv")) {
    throw new ValidationError("Invalid file type. Only CSV files are allowed");
  }
};

export const validateFile = async (
  fileStream: fs.ReadStream,
  headers: string[]
): Promise<void> => {
  if (!fileStream) {
    throw new Error("File stream is null");
  }

  const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    fileStream.on("data", (chunk: string | Buffer) => {
      if (chunk === null) {
        reject(new Error("File stream produced null chunk"));
        return;
      }

      const buffer = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk, "utf8");
      chunks.push(buffer);
    });

    fileStream.on("error", (error) => {
      reject(error);
    });

    fileStream.on("end", () => {
      const fileBuffer = Buffer.concat(chunks);
      const file = {
        buffer: fileBuffer,
        mimetype: "text/csv",
        size: fileBuffer.length,
      };

      try {
        validateFileContent(file as Express.Multer.File);
        validateFileStructure(headers);
      } catch (error) {
        reject(error);
      } finally {
        resolve(fileBuffer);
      }
    });
  });

  if (!fileBuffer) {
    throw new Error("File buffer is null");
  }
};

export const generateProcessId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const validateFileUpload = async (
  file: Express.Multer.File
): Promise<string> => {
  if (!file) {
    throw new ValidationError("No file uploaded");
  }

  validateFileContent(file);

  return generateProcessId();
};
