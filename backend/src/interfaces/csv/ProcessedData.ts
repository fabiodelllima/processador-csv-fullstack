import { CsvData } from "./CsvData";

export interface ProcessedData extends CsvData {
  cpfCnpjValido: boolean;
  prestacaoValida: boolean;
  contratoValido: boolean;
}
