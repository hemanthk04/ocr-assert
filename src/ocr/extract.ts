import Tesseract from "tesseract.js";

export async function extractText(
  input: Buffer | string
): Promise<string> {
  const result = await Tesseract.recognize(input, "eng", {
    logger: () => {} // silence logs
  });

  return result.data.text.trim();
}