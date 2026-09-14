import { ScoredValue } from "./ScoredValue.js";
import { AppError } from "../errors/AppError.js";
import { ClassificationType } from "./types/ClassificationType.js";

export class Classification {
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
    this.type = data.type;
  }

  #areAllScoredValuesCorrected() {
    return this.docId.isCorrected && this.docDateSic.isCorrected && this.docSubject.isCorrected;
  }

  isConfidenceSufficient() {
    return (
      this.docId.isScoreSufficient() &&
      this.docDateSic.isScoreSufficient() &&
      this.docSubject.isScoreSufficient()
    );
  }

  updateMetadata(data) {
    if (data.kind) this.kind = data.kind;
    if (data.docId)
      this.docId = new ScoredValue({ value: data.docId, score: 1, isCorrected: true });
    if (data.docDateSic) {
      this.docDateSic = new ScoredValue({ value: data.docDateSic, score: 1, isCorrected: true });
      this.docDateParsed = new Date(data.docDateSic);
    }
    if (data.docSubject)
      this.docSubject = new ScoredValue({ value: data.docSubject, score: 1, isCorrected: true });

    if (this.#areAllScoredValuesCorrected() && data.kind) this.type = ClassificationType.MANUAL;
    else this.type = ClassificationType.CORRECTED;
  }
}
