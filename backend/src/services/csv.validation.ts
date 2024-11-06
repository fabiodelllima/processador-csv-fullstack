import { CsvData } from "../interfaces/csv/csvData.interface";
import { ValidationError } from "../middlewares/errorHandler";

const validateCpf = (cpf: string): boolean => {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11) {
    throw new ValidationError("CPF must have 11 digits");
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    throw new ValidationError("Invalid CPF: all digits are equal");
  }

  for (let t = 9; t < 11; t++) {
    let d = 0;
    for (let c = 0; c < t; c++) {
      d += Number(cpf[c]) * (t + 1 - c);
    }
    d = ((10 * d) % 11) % 10;
    if (Number(cpf[t]) !== d) {
      throw new ValidationError("Invalid CPF: check digit validation failed");
    }
  }

  return true;
};

const validateCnpj = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/\D/g, "");

  if (cnpj.length !== 14) {
    throw new ValidationError("CNPJ must have 14 digits");
  }

  if (/^(\d)\1{13}$/.test(cnpj)) {
    throw new ValidationError("Invalid CNPJ: all digits are equal");
  }

  for (let t = 12; t < 14; t++) {
    let d = 0;
    let p = t - 7;
    for (let c = t; c >= 0; c--) {
      d += Number(cnpj[c]) * p--;
      if (p < 2) p = 9;
    }
    d = d % 11 < 2 ? 0 : 11 - (d % 11);
    if (Number(cnpj[t]) !== d) {
      throw new ValidationError("Invalid CNPJ: check digit validation failed");
    }
  }

  return true;
};

export const validateDocument = (document: string): boolean => {
  document = document.replace(/\D/g, "");

  if (!document) {
    throw new ValidationError("Document number is required");
  }

  if (document.length === 11) return validateCpf(document);
  if (document.length === 14) return validateCnpj(document);

  throw new ValidationError(
    "Document must be either CPF (11 digits) or CNPJ (14 digits)"
  );
};

export const validateContract = async (data: CsvData): Promise<boolean> => {
  if (!data.nrContrato) {
    throw new ValidationError("Contract number is required");
  }

  if (!data.dtContrato) {
    throw new ValidationError("Contract date is required");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(data.dtContrato)) {
    throw new ValidationError("Invalid contract date format. Use YYYY-MM-DD");
  }

  if (data.vlTotal <= 0) {
    throw new ValidationError("Contract total value must be greater than zero");
  }

  if (data.qtPrestacoes <= 0) {
    throw new ValidationError(
      "Number of installments must be greater than zero"
    );
  }

  return true;
};

export const validateInstallment = async (
  total: number,
  installment: number,
  count: number
): Promise<boolean> => {
  if (count <= 0) {
    throw new ValidationError(
      "Number of installments must be greater than zero"
    );
  }

  if (total <= 0) {
    throw new ValidationError("Total amount must be greater than zero");
  }

  if (installment <= 0) {
    throw new ValidationError("Installment value must be greater than zero");
  }

  const expectedInstallment = total / count;
  const tolerance = 0.01;

  if (
    Math.abs(expectedInstallment - installment) / expectedInstallment >
    tolerance
  ) {
    throw new ValidationError(
      `Invalid installment value. Expected around ${expectedInstallment.toFixed(
        2
      )}, got ${installment.toFixed(2)}`
    );
  }

  return true;
};
