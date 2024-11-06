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
