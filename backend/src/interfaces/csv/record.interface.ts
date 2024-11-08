import { FileData } from "./file.interface";

export interface RecordData extends FileData {
  cpfCnpjValido: boolean;
  prestacaoValida: boolean;
  contratoValido: boolean;
}
