import { normalizeText } from "../normalize/text";
import { similarity } from "../compare/similarity";

export interface AssertOptions {
  /** Text returned by an OCR engine or another text extraction step. */
  actual: string;
  /** Text that should be present after OCR-safe normalization. */
  expected: string;
  /** Minimum similarity score required to pass. Defaults to 0.85. */
  threshold?: number;
}

/**
 * Assert that OCR text is similar enough to an expected string.
 *
 * The comparison normalizes common OCR substitutions before computing a
 * confusion-aware similarity score. Throws an Error with diagnostic details
 * when the score falls below the configured threshold.
 */
export function assertOCR({
  actual,
  expected,
  threshold = 0.85
}: AssertOptions): void {
  const normActual = normalizeText(actual);
  const normExpected = normalizeText(expected);

  const { score, confusionRatio, errorDensity } = similarity(
    normActual,
    normExpected
  );

  // Adaptive threshold
  let adjustedThreshold = threshold;

  if (confusionRatio > 0.45 && errorDensity < 0.3) {
    adjustedThreshold -= 0.1;
  }

  if (score >= adjustedThreshold) return;

  throw new Error(
    formatError(
      actual,
      expected,
      normActual,
      normExpected,
      score,
      confusionRatio,
      errorDensity,
      adjustedThreshold
    )
  );
}

function formatError(
  rawActual: string,
  rawExpected: string,
  normalizedActual: string,
  normalizedExpected: string,
  score: number,
  confusionRatio: number,
  errorDensity: number,
  threshold: number
): string {
  return [
    "OCR Assertion Failed",
    "",
    "Raw Text:",
    `Expected: ${rawExpected}`,
    `Actual:   ${rawActual}`,
    "",
    "Normalized Text:",
    `Expected: ${normalizedExpected}`,
    `Actual:   ${normalizedActual}`,
    "",
    "Similarity Breakdown:",
    `Score:            ${score.toFixed(2)}`,
    `Threshold Used:   ${threshold.toFixed(2)}`,
    `Confusion Ratio:  ${confusionRatio.toFixed(2)}`,
    `Error Density:    ${errorDensity.toFixed(2)}`
  ].join("\n");
}
