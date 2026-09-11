import { config } from "../config.js";

export class ScoredValue {
  constructor({ value, score }) {
    this.value = value;
    this.score = score;
  }

  isScoreSufficient() {
    return this.score >= config.confidenceThreshold;
  }
}
