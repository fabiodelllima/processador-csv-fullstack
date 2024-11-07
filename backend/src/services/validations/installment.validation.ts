import { ValidationError } from "../../errors/ValidationError";

export const validateInstallment = (
  total: number,
  installment: number,
  count: number
): boolean => {
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

  return true;
};
