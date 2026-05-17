import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertScreenshotOCR } from "../src/assert/assertScreenshotOCR";
import { preprocessImage } from "../src/preprocess/image";
import { extractText } from "../src/ocr/extract";

vi.mock("../src/preprocess/image", () => ({
  preprocessImage: vi.fn()
}));

vi.mock("../src/ocr/extract", () => ({
  extractText: vi.fn()
}));

const mockedPreprocessImage = vi.mocked(preprocessImage);
const mockedExtractText = vi.mocked(extractText);

describe("assertScreenshotOCR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preprocesses screenshots with OCR-friendly defaults before asserting", async () => {
    const image = Buffer.from("raw image");
    const processed = Buffer.from("processed image");

    mockedPreprocessImage.mockResolvedValueOnce(processed);
    mockedExtractText.mockResolvedValueOnce("PAYMENT SUCCESSFUL");

    const actual = await assertScreenshotOCR({
      image,
      expected: "PAYMENT SUCCESSFUL"
    });

    expect(mockedPreprocessImage).toHaveBeenCalledWith(image, {
      grayscale: true,
      contrast: 1.2
    });
    expect(mockedExtractText).toHaveBeenCalledWith(processed);
    expect(actual).toBe("PAYMENT SUCCESSFUL");
  });

  it("allows callers to override preprocessing options", async () => {
    const image = Buffer.from("raw image");
    const processed = Buffer.from("cropped image");

    mockedPreprocessImage.mockResolvedValueOnce(processed);
    mockedExtractText.mockResolvedValueOnce("TOTAL 100");

    await assertScreenshotOCR({
      image,
      expected: "TOTAL 100",
      preprocess: {
        crop: { left: 10, top: 20, width: 300, height: 80 },
        grayscale: true,
        contrast: 1.4
      }
    });

    expect(mockedPreprocessImage).toHaveBeenCalledWith(image, {
      crop: { left: 10, top: 20, width: 300, height: 80 },
      grayscale: true,
      contrast: 1.4
    });
  });

  it("can disable preprocessing", async () => {
    const image = Buffer.from("already processed image");

    mockedExtractText.mockResolvedValueOnce("SUCCESS");

    const actual = await assertScreenshotOCR({
      image,
      expected: "SUCCESS",
      preprocess: false
    });

    expect(mockedPreprocessImage).not.toHaveBeenCalled();
    expect(mockedExtractText).toHaveBeenCalledWith(image);
    expect(actual).toBe("SUCCESS");
  });

  it("passes threshold through to assertOCR", async () => {
    mockedPreprocessImage.mockResolvedValueOnce(Buffer.from("processed image"));
    mockedExtractText.mockResolvedValueOnce("TOTAL 800");

    await expect(
      assertScreenshotOCR({
        image: Buffer.from("raw image"),
        expected: "TOTAL 100",
        threshold: 0.99
      })
    ).rejects.toThrow("OCR Assertion Failed");
  });
});
