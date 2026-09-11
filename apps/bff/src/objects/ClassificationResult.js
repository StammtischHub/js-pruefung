import { ScoredValue } from "./ScoredValue.js";

export class ClassificationResult {
  constructor({ kind, doc_id, doc_date_sic, doc_date_parsed, doc_subject }) {
    this.kind = kind;
    this.docId = new ScoredValue(doc_id);
    this.docDateSic = new ScoredValue(doc_date_sic);
    this.docDateParsed = new Date(doc_date_parsed);
    this.docSubject = new ScoredValue(doc_subject);
  }

  isConfidenceSufficient() {
    return (
      this.docId.isScoreSufficient() &&
      this.docDateSic.isScoreSufficient() &&
      this.docSubject.isScoreSufficient()
    );
  }
}
