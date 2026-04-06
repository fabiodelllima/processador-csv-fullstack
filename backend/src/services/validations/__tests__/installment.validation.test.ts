import { describe, it, expect } from "vitest";
import { validateInstallment } from "../installment.validation";

describe("validateInstallment", () => {
  it("should return true when installment matches total/count", () => {
    expect(validateInstallment(1000, 100, 10)).toBe(true);
  });

  it("should return true within tolerance of 0.01", () => {
    expect(validateInstallment(1000, 333.33, 3)).toBe(true);
  });

  it("should throw when installment does not match", () => {
    expect(() => validateInstallment(1000, 200, 10)).toThrow("Installment mismatch");
  });

  it("should throw when count is zero", () => {
    expect(() => validateInstallment(1000, 100, 0)).toThrow("greater than zero");
  });

  it("should throw when count is negative", () => {
    expect(() => validateInstallment(1000, 100, -1)).toThrow("greater than zero");
  });

  it("should throw when total is zero", () => {
    expect(() => validateInstallment(0, 100, 10)).toThrow("Total amount");
  });

  it("should throw when installment is zero", () => {
    expect(() => validateInstallment(1000, 0, 10)).toThrow("Installment value");
  });
});
