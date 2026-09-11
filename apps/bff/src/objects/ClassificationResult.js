import { ScoredValue } from "./ScoredValue.js";

export class ClassificationResult {
  constructor(data) {
    this.kind = data.kind;
    this.docId = new ScoredValue(data.doc_id);
    this.docDateSic = new ScoredValue(data.doc_date_sic);
    this.docDateParsed = new Date(data.doc_date_parsed);
    this.docSubject = new ScoredValue(data.doc_subject);
  }

  isConfidenceSufficient() {
    return (
      this.docId.isScoreSufficient() &&
      this.docDateSic.isScoreSufficient() &&
      this.docSubject.isScoreSufficient()
    );
  }
}
