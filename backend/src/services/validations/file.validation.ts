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
] as const;

const validateFileStructure = async (headers: string[]): Promise<void> => {
  const cleanHeaders = headers.map((header) =>
    header.trim().replace(/[\r\n"]/g, "")
  );

  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !cleanHeaders.includes(column)
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

export const validateFileUpload = async (
  file: Express.Multer.File
): Promise<string> => {
  if (!file) {
    throw new ValidationError("No file uploaded");
  }

  validateFileContent(file);
  return generateProcessId();
};

export const generateProcessId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};
