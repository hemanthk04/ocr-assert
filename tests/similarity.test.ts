import { describe, it, expect } from "vitest";
import { similarity } from "../src/compare/similarity";

describe("OCR similarity engine", () => {
  it("treats two empty strings as a perfect match", () => {
    const result = similarity("", "");

    expect(result).toEqual({
      score: 1,
      confusionRatio: 1,
      errorDensity: 0
    });
  });

  it("passes OCR confusion cases", () => {
    const result = similarity("TOTAL 100", "TOTAL IOO");
    expect(result.score).toBeGreaterThan(0.8);
  });

  it("fails real numeric mismatch", () => {
    const result = similarity("TOTAL 100", "TOTAL 800");
    expect(result.score).toBeLessThan(0.85);
  });

  it("passes heavy OCR noise", () => {
    const result = similarity(
      "O0O0 111 LILI",
      "0000 111 1I1I"
    );
    expect(result.score).toBeGreaterThan(0.75);
  });
});
