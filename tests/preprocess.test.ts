import { describe, expect, it } from "vitest";
import { preprocessImage } from "../src/preprocess/image";

const sampleImage = Buffer.from(`
  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" fill="white" />
    <text x="2" y="14" font-size="12" fill="black">A</text>
  </svg>
`);

describe("image preprocessing", () => {
  it("rejects negative crop left coordinate", async () => {
    await expect(
      preprocessImage(sampleImage, {
        crop: { left: -1, top: 0, width: 10, height: 10 }
      })
    ).rejects.toThrow("left must be a non-negative number");
  });

  it("rejects negative crop top coordinate", async () => {
    await expect(
      preprocessImage(sampleImage, {
        crop: { left: 0, top: -1, width: 10, height: 10 }
      })
    ).rejects.toThrow("top must be a non-negative number");
  });

  it("rejects non-positive crop width", async () => {
    await expect(
      preprocessImage(sampleImage, {
        crop: { left: 0, top: 0, width: 0, height: 10 }
      })
    ).rejects.toThrow("width must be a positive number");
  });

  it("rejects non-positive crop height", async () => {
    await expect(
      preprocessImage(sampleImage, {
        crop: { left: 0, top: 0, width: 10, height: 0 }
      })
    ).rejects.toThrow("height must be a positive number");
  });

  it("rejects non-positive contrast", async () => {
    await expect(
      preprocessImage(sampleImage, { contrast: 0 })
    ).rejects.toThrow("contrast must be greater than 0");
  });

  it("rejects invalid image buffers", async () => {
    await expect(preprocessImage(Buffer.from("not an image"))).rejects.toThrow();
  });

  it("accepts valid preprocessing options", async () => {
    const result = await preprocessImage(sampleImage, {
      crop: { left: 0, top: 0, width: 10, height: 10 },
      grayscale: true,
      contrast: 1.2
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });
});
