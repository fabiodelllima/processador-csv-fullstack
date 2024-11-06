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
