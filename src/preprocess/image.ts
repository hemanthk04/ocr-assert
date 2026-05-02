import sharp from "sharp";

export interface PreprocessOptions {
  grayscale?: boolean;
  contrast?: number; // 1 = normal
  crop?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export async function preprocessImage(
  input: Buffer | string,
  options: PreprocessOptions = {}
): Promise<Buffer> {
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