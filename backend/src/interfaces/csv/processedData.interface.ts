import { CsvData } from "./csvData.interface";

export interface ProcessedData extends CsvData {
  cpfCnpjValido: boolean;
  prestacaoValida: boolean;
  contratoValido: boolean;
}
