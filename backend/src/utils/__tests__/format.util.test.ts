import { describe, it, expect } from "vitest";
import { parseDecimalNumber, parseWholeNumber } from "../format.util";

describe("parseDecimalNumber", () => {
  it("should parse Brazilian format (1.234,56)", () => {
    expect(parseDecimalNumber("1.234,56")).toBe(1234.56);
  });

  it("should parse standard decimal (1234.56)", () => {
    expect(parseDecimalNumber("1234.56")).toBe(1234.56);
  });

  it("should return number if already a number", () => {
    expect(parseDecimalNumber(42.5)).toBe(42.5);
  });

  it("should parse value with only comma (0,99)", () => {
    expect(parseDecimalNumber("0,99")).toBe(0.99);
  });

  it("should parse large Brazilian format (1.234.567,89)", () => {
    expect(parseDecimalNumber("1.234.567,89")).toBe(1234567.89);
  });

  it("should handle zero", () => {
    expect(parseDecimalNumber("0")).toBe(0);
  });
});

describe("parseWholeNumber", () => {
  it("should parse formatted number (1.234)", () => {
    expect(parseWholeNumber("1.234")).toBe(1234);
  });

  it("should return floor of number input", () => {
    expect(parseWholeNumber(42.9)).toBe(42);
  });

  it("should strip non-digit characters", () => {
    expect(parseWholeNumber("abc123def")).toBe(123);
  });

  it("should handle zero", () => {
    expect(parseWholeNumber("0")).toBe(0);
  });
});
