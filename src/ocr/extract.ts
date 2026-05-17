import Tesseract from "tesseract.js";

/**
 * Run English OCR over an image Buffer or filesystem path.
 *
 * Returns Tesseract's extracted text with leading and trailing whitespace removed.
 */
export async function extractText(
  input: Buffer | string
): Promise<string> {
  const result = await Tesseract.recognize(input, "eng", {
    logger: () => {} // silence logs
  });

  return result.data.text.trim();
}
