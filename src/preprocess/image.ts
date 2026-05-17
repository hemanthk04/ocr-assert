import sharp from "sharp";

export interface PreprocessOptions {
  /** Convert the image to grayscale before OCR. */
  grayscale?: boolean;
  /** Contrast multiplier. Use 1 for normal contrast. */
  contrast?: number; // 1 = normal
  /** Crop rectangle applied before other preprocessing operations. */
  crop?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

function validatePreprocessOptions(options: PreprocessOptions): void {
  if (options.crop) {
    const { left, top, width, height } = options.crop;

    if (left < 0) {
      throw new Error("Invalid crop option: left must be a non-negative number.");
    }

    if (top < 0) {
      throw new Error("Invalid crop option: top must be a non-negative number.");
    }

    if (width <= 0) {
      throw new Error("Invalid crop option: width must be a positive number.");
    }

    if (height <= 0) {
      throw new Error("Invalid crop option: height must be a positive number.");
    }
  }

  if (options.contrast !== undefined && options.contrast <= 0) {
    throw new Error("Invalid contrast option: contrast must be greater than 0.");
  }
}

/**
 * Prepare an image for OCR by optionally cropping, grayscaling, and adjusting contrast.
 *
 * Accepts a Buffer or filesystem path and returns the processed image as a Buffer.
 */
export async function preprocessImage(
  input: Buffer | string,
  options: PreprocessOptions = {}
): Promise<Buffer> {
  validatePreprocessOptions(options);

  let image = sharp(input);

  if (options.crop) {
    image = image.extract(options.crop);
  }

  if (options.grayscale) {
    image = image.grayscale();
  }

  if (options.contrast && options.contrast !== 1) {
    image = image.linear(options.contrast, -(128 * options.contrast) + 128);
  }

  return await image.toBuffer();
}
