import { FileData } from "../../interfaces";
import { ValidationError } from "../../errors/ValidationError";

export const validateContract = (data: FileData): boolean => {
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
