import { describe, it, expect } from "vitest";
import { validateContract } from "../contract.validation";
import type { FileData } from "../../../interfaces/csv/file.interface";

const makeFileData = (overrides: Partial<FileData> = {}): FileData => ({
  nrInst: "1",
  nrAgencia: "1",
  cdClient: "1",
  nmClient: "Test",
  nrCpfCnpj: "52998224725",
  nrContrato: "12345",
  dtContrato: "20240115",
  qtPrestacoes: 10,
  vlTotal: 1000,
  cdProduto: "1",
  dsProduto: "Test",
  cdCarteira: "1",
  dsCarteira: "Test",
  nrProposta: "1",
  nrPresta: 1,
  tpPresta: "1",
  nrSeqPre: "1",
  dtVctPre: "20240215",
  vlPresta: 100,
  vlMora: 0,
  vlMulta: 0,
  vlOutAcr: 0,
  vlIof: 0,
  vlDescon: 0,
  vlAtual: 1000,
  idSituac: "1",
  idSitVen: "1",
  ...overrides,
});

describe("validateContract", () => {
  it("should return true for valid contract data", () => {
    expect(validateContract(makeFileData())).toBe(true);
  });

  it("should throw when contract number is empty", () => {
    expect(() => validateContract(makeFileData({ nrContrato: "" }))).toThrow("required");
  });

  it("should throw when contract date is empty", () => {
    expect(() => validateContract(makeFileData({ dtContrato: "" }))).toThrow("required");
  });

  it("should throw when contract date format is invalid", () => {
    expect(() => validateContract(makeFileData({ dtContrato: "2024-01-15" }))).toThrow("YYYYMMDD");
  });

  it("should throw when total value is zero", () => {
    expect(() => validateContract(makeFileData({ vlTotal: 0 }))).toThrow("greater than zero");
  });

  it("should throw when installment count is zero", () => {
    expect(() => validateContract(makeFileData({ qtPrestacoes: 0 }))).toThrow("greater than zero");
  });
});
