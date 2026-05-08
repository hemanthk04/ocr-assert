import { areConfusable } from "../normalize/text";

export interface SimilarityResult {
  score: number;
  confusionRatio: number;
  errorDensity: number;
}

export function similarity(a: string, b: string): SimilarityResult {
  const maxLen = Math.max(a.length, b.length);

  if (maxLen === 0) {
    return { score: 1, confusionRatio: 1, errorDensity: 0 };
  }

  const distance = weightedDistance(a, b);
  const { confusions, mismatches } = computeStats(a, b);

  const errorDensity = mismatches / maxLen;
  const confusionRatio = mismatches === 0 ? 1 : confusions / mismatches;

  // 🔥 NEW: make distance confusion-aware
  const effectiveDistance =
    confusionRatio > 0.5
      ? distance * (1 - 0.5 * confusionRatio) // reduce penalty proportionally
      : distance;

  let score = 1 - distance / maxLen;

// 🔥 NEW: strong compensation for OCR confusions
  if (confusionRatio > 0.5) {
  const bonus = confusionRatio * 0.4; // strong effect
  score += bonus;
  }

  //Smaller boost if there are some confusions but not dominant
  if (confusionRatio > 0.85) {
    score += 0.1;
  } else if (confusionRatio > 0.7) {
    score += 0.05;
  }

  //If error rates are high, reduce score
  if (errorDensity > 0.25 && confusionRatio < 0.6) {
    score -= 0.15;
  }

  score = Math.max(0, Math.min(1, score));

  return {
    score,
    confusionRatio,
    errorDensity
  };
}

function computeStats(a: string, b: string) {
  // normalize alignment (remove spaces)
  const aClean = a.replace(/\s+/g, "");
  const bClean = b.replace(/\s+/g, "");

  let confusions = 0;
  let mismatches = 0;

  const maxLen = Math.max(aClean.length, bClean.length);

  for (let i = 0; i < maxLen; i++) {
    const x = aClean[i];
    const y = bClean[i];

    if (!x || !y) {
      mismatches++;
      continue;
    }

    if (x === y) continue;

    mismatches++;

    if (areConfusable(x, y)) {
      confusions++;
    }
  }

  return { confusions, mismatches };
}

function weightedDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const x = a[i - 1];
      const y = b[j - 1];

      let cost;

      if (x === y) {
        cost = 0;
      } else if (areConfusable(x, y)) {
        cost = 0.1;
      } else {
        cost = 1.5;
      }

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}