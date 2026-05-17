# ocr-assert

[![CI](https://github.com/hemanthk04/ocr-assert/actions/workflows/ci.yml/badge.svg)](https://github.com/hemanthk04/ocr-assert/actions/workflows/ci.yml)

[![npm version](https://img.shields.io/npm/v/ocr-assert.svg)](https://www.npmjs.com/package/ocr-assert)

Tolerant OCR assertions for UI testing.

`ocr-assert` helps reduce flaky OCR-based tests by normalizing common OCR confusions (like `O <-> 0`, `I/L <-> 1`, `Z <-> 2`, `S <-> 5`) and comparing text using a confusion-aware similarity score.

> Status: early version (v0.1.0). API may evolve.

---

## Why?

When you validate UI text via screenshots + OCR (canvas apps, PDFs, images, charts, games), tiny OCR mistakes can break otherwise-correct tests:

- `O` recognized as `0`
- `I` or `L` recognized as `1`
- `Z` recognized as `2`
- extra / missing whitespace

`ocr-assert` makes assertions more tolerant while still failing when errors look random or too dense.

---

## Install

```bash
npm install ocr-assert
```

## Quickstart

### 1) Assert two strings (already OCR'd)

```ts
import { assertOCR } from "ocr-assert";

assertOCR({
  actual: "TOTAl 10O",
  expected: "TOTAL 100",
  threshold: 0.85, // optional (default: 0.85)
});
```

### 2) OCR an image and assert

```ts
import { preprocessImage, extractText, assertOCR } from "ocr-assert";

const processed = await preprocessImage("./screenshot.png", {
  crop: { left: 100, top: 200, width: 500, height: 120 },
  grayscale: true,
  contrast: 1.2,
});

const text = await extractText(processed);

assertOCR({
  actual: text,
  expected: "PAYMENT SUCCESSFUL",
});
```

### 3) One-step screenshot OCR assertion

```ts
import { assertScreenshotOCR } from "ocr-assert";

const actual = await assertScreenshotOCR({
  image: "./screenshot.png",
  expected: "PAYMENT SUCCESSFUL",
});

console.log(actual);
```

---

## Playwright example

```ts
import { test, expect } from "@playwright/test";
import { assertScreenshotOCR } from "ocr-assert";

test("canvas receipt shows success", async ({ page }) => {
  await page.goto("https://example.com");

  const shot = await page.screenshot();

  const actual = await assertScreenshotOCR({
    image: shot,
    expected: "SUCCESS",
    preprocess: {
      crop: { left: 100, top: 200, width: 500, height: 120 },
    },
  });

  // Optional: still keep an explicit expect so test runners show an assertion step
  expect(actual).toContain("SUCCESS");
});
```

> Tip: For best OCR accuracy, crop tightly to the text region.

---

## API

All public functions and TypeScript types are exported from the package root.

```ts
import {
  assertOCR,
  assertScreenshotOCR,
  extractText,
  normalizeText,
  preprocessImage,
  similarity,
  type AssertOptions,
  type AssertScreenshotOCROptions,
  type PreprocessOptions,
  type SimilarityResult,
} from "ocr-assert";
```

### `assertOCR(options)`

```ts
type AssertOptions = {
  actual: string;
  expected: string;
  threshold?: number; // default: 0.85
};

function assertOCR(options: AssertOptions): void;
```

- Normalizes both strings (uppercase, removes non-alphanumeric noise, applies OCR confusion normalization).
- Computes a confusion-aware similarity score.
- Uses an adaptive threshold in some cases (high confusion ratio with acceptable error density).
- Throws an error on failure with diagnostic metrics.
- Exported type: `AssertOptions`.

---

### `assertScreenshotOCR(options)`

```ts
type AssertScreenshotOCROptions = {
  image: Buffer | string;
  expected: string;
  threshold?: number; // default: 0.85
  preprocess?: PreprocessOptions | false; // default: { grayscale: true, contrast: 1.2 }
};

function assertScreenshotOCR(
  options: AssertScreenshotOCROptions
): Promise<string>;
```

Preprocesses a screenshot/image, extracts text, runs `assertOCR()`, and returns the raw extracted text for debugging. Pass `preprocess: false` to OCR the original image directly.

- Exported type: `AssertScreenshotOCROptions`.

---

### `extractText(input)`

```ts
function extractText(input: Buffer | string): Promise<string>;
```

Runs OCR using `tesseract.js` (English) and returns trimmed text.

---

### `preprocessImage(input, options)`

```ts
type PreprocessOptions = {
  grayscale?: boolean;
  contrast?: number; // 1 = normal
  crop?: { left: number; top: number; width: number; height: number };
};

function preprocessImage(
  input: Buffer | string,
  options?: PreprocessOptions
): Promise<Buffer>;
```

Uses `sharp` to optionally crop, grayscale, and adjust contrast.

- Exported type: `PreprocessOptions`.

---

### `normalizeText(input)`

```ts
function normalizeText(input: string): string;
```

Applies Unicode normalization, uppercasing, noise removal, OCR-safe canonicalization, and whitespace normalization.

---

### `similarity(a, b)`

```ts
type SimilarityResult = {
  score: number;          // 0..1
  confusionRatio: number; // 0..1 (how many mismatches are OCR-like)
  errorDensity: number;   // 0..1 (mismatches per length)
};

function similarity(a: string, b: string): SimilarityResult;
```

Computes a weighted edit-distance where confusable substitutions are penalized less than random substitutions.

- Exported type: `SimilarityResult`.

---

## How it works (high level)

1. **Preprocess (optional):** crop / grayscale / contrast
2. **OCR (optional):** extract text via Tesseract
3. **Normalize:** remove noise + convert common OCR confusions to canonical forms
4. **Compare:** weighted distance + confusion-aware scoring
5. **Assert:** fail only when similarity falls below the (possibly adaptive) threshold

---

## Troubleshooting

- **OCR output is empty / garbage:** crop tighter, increase contrast slightly, ensure the text is large enough.
- **False positives:** raise the `threshold`.
- **False negatives from OCR confusions:** lower the `threshold` a bit (or improve preprocessing).

---

## Roadmap (suggested)

- Alignment-aware confusion stats
- Reusable Tesseract worker for speed
- Custom confusion maps and normalization rules
- `contains` / `regex` style assertions

---

## License

MIT
