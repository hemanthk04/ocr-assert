import {
  preprocessImage,
  type PreprocessOptions
} from "../preprocess/image";
import { extractText } from "../ocr/extract";
import { assertOCR, type AssertOptions } from "./assertOCR";

export interface AssertScreenshotOCROptions {
  image: Buffer | string;
  expected: string;
  threshold?: AssertOptions["threshold"];
  preprocess?: PreprocessOptions | false;
}

const DEFAULT_PREPROCESS_OPTIONS: PreprocessOptions = {
  grayscale: true,
  contrast: 1.2
};

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
