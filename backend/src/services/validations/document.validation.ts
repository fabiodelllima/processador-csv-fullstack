import { ValidationError } from "../../errors/ValidationError";

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

const validateCpf = (cpf: string): boolean => {
  if (/^(\d)\1+$/.test(cpf)) {
    throw new ValidationError("Invalid CPF: all digits are equal");
  }

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    throw new ValidationError("Invalid CPF: check digit validation failed");
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    throw new ValidationError("Invalid CPF: check digit validation failed");
  }

  return true;
};

const validateCnpj = (cnpj: string): boolean => {
  if (/^(\d)\1+$/.test(cnpj)) {
    throw new ValidationError("Invalid CNPJ: all digits are equal");
  }

  let sum = 0;
  let pos = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  if (result !== parseInt(cnpj.charAt(12))) {
    throw new ValidationError(
      "Invalid CNPJ: first check digit validation failed"
    );
  }

  sum = 0;
  pos = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  if (result !== parseInt(cnpj.charAt(13))) {
    throw new ValidationError(
      "Invalid CNPJ: second check digit validation failed"
    );
  }

  return true;
};
