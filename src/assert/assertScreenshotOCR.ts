import {
  preprocessImage,
  type PreprocessOptions
} from "../preprocess/image";
import { extractText } from "../ocr/extract";
import { assertOCR, type AssertOptions } from "./assertOCR";

export interface AssertScreenshotOCROptions {
  /** Screenshot or image input as a Buffer or filesystem path. */
  image: Buffer | string;
  /** Text expected to be found by OCR after preprocessing. */
  expected: string;
  /** Minimum similarity score required to pass. Defaults to 0.85. */
  threshold?: AssertOptions["threshold"];
  /** Preprocessing options to apply before OCR, or false to disable preprocessing. */
  preprocess?: PreprocessOptions | false;
}

const DEFAULT_PREPROCESS_OPTIONS: PreprocessOptions = {
  grayscale: true,
  contrast: 1.2
};

/**
 * Preprocess an image, extract OCR text, and assert it against an expected value.
 *
 * By default this applies OCR-friendly preprocessing with grayscale and mild
 * contrast. Returns the raw extracted text to make failed tests easier to debug.
 */
export async function assertScreenshotOCR({
  image,
  expected,
  threshold,
  preprocess = DEFAULT_PREPROCESS_OPTIONS
}: AssertScreenshotOCROptions): Promise<string> {
  const ocrInput =
    preprocess === false ? image : await preprocessImage(image, preprocess);

  const actual = await extractText(ocrInput);

  assertOCR({
    actual,
    expected,
    threshold
  });

  return actual;
}
