import { preprocessImage, extractText, assertOCR } from "../src";

async function main() {
  const image = await preprocessImage("screenshots/numbercheck.png", {
    grayscale: true,
    contrast: 1.2
  });

  const actual = await extractText(image);

  console.log("OCR text:");
  console.log(actual);

  assertOCR({
    actual,
    expected: "TOTAL : 100",
    threshold: 0.85
  });

  console.log("OCR assertion passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
