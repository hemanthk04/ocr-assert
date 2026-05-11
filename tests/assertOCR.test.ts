import { describe, expect, it } from "vitest";
import { assertOCR } from "../src/assert/assertOCR";

describe("assertOCR", () => {
  it("does not throw when OCR text is similar enough", () => {
    expect(() => {
      assertOCR({
        actual: "TOTAL IOO",
        expected: "TOTAL 100"
      });
    }).not.toThrow();
  });

  it("shows raw text, normalized text, and score breakdown on failure", () => {
    let error: unknown;

    try {
      assertOCR({
        actual: "Total: $800",
        expected: "Total: $100",
        threshold: 0.99
      });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);

    const message = (error as Error).message;

    expect(message).toContain("OCR Assertion Failed");
    expect(message).toContain("Raw Text:");
    expect(message).toContain("Expected: Total: $100");
    expect(message).toContain("Actual:   Total: $800");
    expect(message).toContain("Normalized Text:");
    expect(message).toContain("Expected: T0TA1 100");
    expect(message).toContain("Actual:   T0TA1 800");
    expect(message).toContain("Similarity Breakdown:");
    expect(message).toContain("Score:");
    expect(message).toContain("Threshold Used:");
    expect(message).toContain("Confusion Ratio:");
    expect(message).toContain("Error Density:");
  });
});
