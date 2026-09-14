import { config } from "../config.js";

export class ScoredValue {
  constructor({ value, score, isCorrected = false }) {
    this.value = value;
    this.score = score;
    this.isCorrected = isCorrected;
  }

  isScoreSufficient() {
    return this.score >= config.confidenceThreshold;
  }
}
