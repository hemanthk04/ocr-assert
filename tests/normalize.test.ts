import { describe, expect, it } from "vitest";
import { areConfusable, normalizeText } from "../src/normalize/text";

describe("OCR text normalization", () => {
  it("normalizes empty input to an empty string", () => {
    expect(normalizeText("")).toBe("");
  });

  it("strips punctuation and collapses whitespace", () => {
    expect(normalizeText("  Total:   $100.00\n")).toBe("T0TA1 10000");
  });

  it("canonicalizes common OCR confusion characters", () => {
    expect(normalizeText("OILZS")).toBe("01125");
  });

  it("recognizes mapped OCR confusion pairs", () => {
    expect(areConfusable("0", "O")).toBe(true);
    expect(areConfusable("1", "I")).toBe(true);
    expect(areConfusable("1", "L")).toBe(true);
    expect(areConfusable("2", "Z")).toBe(true);
    expect(areConfusable("5", "S")).toBe(true);
    expect(areConfusable("3", "8")).toBe(false);
  });
});
