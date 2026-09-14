import { ScoredValue } from "./ScoredValue.js";
import { AppError } from "../errors/AppError.js";

export class ClassificationResult {
  throwErrorForUnsatisfiedData(message) {
    throw new AppError(message, 400);
  }

  constructor(data) {
    this.kind = data.kind;
    this.docId = data.docId
      ? new ScoredValue(data.docId)
      : data.doc_id
        ? new ScoredValue(data.doc_id)
        : this.throwErrorForUnsatisfiedData("docId or doc_id is required", 400);
    this.docDateSic = data.docDateSic
      ? new ScoredValue(data.docDateSic)
      : data.doc_date_sic
        ? new ScoredValue(data.doc_date_sic)
        : this.throwErrorForUnsatisfiedData("docDateSic or doc_date_sic is required", 400);
    this.docDateParsed = new Date(data.docDateParsed);
    this.docSubject = data.docSubject
      ? new ScoredValue(data.docSubject)
      : data.doc_subject
        ? new ScoredValue(data.doc_subject)
        : this.throwErrorForUnsatisfiedData("docSubject or doc_subject is required", 400);
  }

  isConfidenceSufficient() {
    return (
      this.docId.isScoreSufficient() &&
      this.docDateSic.isScoreSufficient() &&
      this.docSubject.isScoreSufficient()
    );
  }

  updateMetadata({ kind, docId, docDateSic, docSubject }) {
    if (kind !== undefined) this.kind = kind;
    if (docId !== undefined) this.docId = new ScoredValue({ value: docId, score: 1 });
    if (docDateSic !== undefined)
      this.docDateSic = new ScoredValue({ value: docDateSic, score: 1 });
    if (docSubject !== undefined)
      this.docSubject = new ScoredValue({ value: docSubject, score: 1 });
  }
}
