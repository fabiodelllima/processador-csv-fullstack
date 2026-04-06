import { describe, it, expect } from "vitest";
import { validateDocument } from "../document.validation";

describe("validateDocument", () => {
  describe("CPF validation", () => {
    it("should return true for a valid CPF", () => {
      expect(validateDocument("529.982.247-25")).toBe(true);
    });

    it("should return true for a valid CPF without formatting", () => {
      expect(validateDocument("52998224725")).toBe(true);
    });

    it("should throw for CPF with all equal digits", () => {
      expect(() => validateDocument("111.111.111-11")).toThrow("all digits are equal");
    });

    it("should throw for CPF with invalid first check digit", () => {
      expect(() => validateDocument("529.982.247-35")).toThrow("check digit");
    });

    it("should throw for CPF with invalid second check digit", () => {
      expect(() => validateDocument("529.982.247-26")).toThrow("check digit");
    });

    it("should throw for empty document", () => {
      expect(() => validateDocument("")).toThrow("required");
    });

    it("should throw for CPF with wrong length", () => {
      expect(() => validateDocument("1234567")).toThrow("11 digits");
    });
  });

  describe("CNPJ validation", () => {
    it("should return true for a valid CNPJ", () => {
      expect(validateDocument("11.222.333/0001-81")).toBe(true);
    });

    it("should return true for a valid CNPJ without formatting", () => {
      expect(validateDocument("11222333000181")).toBe(true);
    });

    it("should throw for CNPJ with all equal digits", () => {
      expect(() => validateDocument("11.111.111/1111-11")).toThrow("all digits are equal");
    });

    it("should throw for CNPJ with invalid first check digit", () => {
      expect(() => validateDocument("11.222.333/0001-91")).toThrow("first check digit");
    });

    it("should throw for CNPJ with invalid second check digit", () => {
      expect(() => validateDocument("11.222.333/0001-82")).toThrow("second check digit");
    });
  });
});
