import { CsvData } from "../interfaces/csv/csvData.interface";

/*************  ✨ Codeium Command ⭐  *************/
/******  8f884da7-351a-4148-b7a0-68ccd30cc903  *******/
export const validateDocument = (document: string): boolean => {
  return true;
};

export const validateContract = async (data: CsvData): Promise<boolean> => {
  return true;
};

export const validateInstallment = async (
  total: number,
  installment: number,
  count: number
): Promise<boolean> => {
  const expectedInstallment = total / count;
  return Math.abs(expectedInstallment - installment) < 0.01;
};
