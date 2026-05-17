/**
 * Confusion map for OCR-like substitutions.
 * All characters are uppercase because we normalize input to uppercase.
 */

const CONFUSION_MAP: Record<string, string[]> = {
  "0": ["O"],
  "1": ["I", "L"],
  "2": ["Z"],
  "5": ["S"]
};

/**
 * Normalize a single character into its canonical OCR-safe form.
 */
function normalizeChar(c: string): string {
  if (c === "O") return "0";
  if (c === "I" || c === "L") return "1";
  if (c === "Z") return "2";
  if (c === "S") return "5";
  return c;
}

/**
 * Normalize text into an OCR-safe comparison form.
 *
 * Applies Unicode normalization, uppercasing, noise removal, common OCR
 * character canonicalization, and whitespace normalization.
 */
export function normalizeText(input: string): string {
  return input
    .normalize("NFKD")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .split("")
    .map(normalizeChar)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if two single-character strings are equivalent under known OCR confusions.
 */
export function areConfusable(a: string, b: string): boolean {
  if (a === b) return true;

  for (const [key, values] of Object.entries(CONFUSION_MAP)) {
    if (
      (a === key && values.includes(b)) ||
      (b === key && values.includes(a))
    ) {
      return true;
    }
  }

  return false;
}
