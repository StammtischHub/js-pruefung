import { State } from "./types/State.js";
import { config } from "../config.js";
import { readFile, rename, writeFile } from "node:fs/promises";
import { addDocumentToMetadata, updateDocumentInMetadata } from "../services/MetadataService.js";
import { ClassificationType } from "./types/ClassificationType.js";
import { v4 as uuid } from "uuid";
import { ClassificationResult } from "./ClassificationResult.js";
import { classifyDocument } from "../services/ClassificationService.js";

export class Document {
  constructor(data) {
    this.id = data.id;
    this.originalName = data.originalName;
    this.path = data.path;
    this.state = data.state;
    this.classificationResult = data.classificationResult
      ? new ClassificationResult(data.classificationResult)
      : null;
    this.classificationType = data.classificationType ?? null;
    this.editedBy = data.editedBy ?? [];
    this.deleteFlagSetDate = data.deleteFlagSetDate ?? null;
  }

  static async forScannerFile(filepath) {
    const filepathParts = filepath.split("/");
    const stateFolder = filepathParts[filepathParts.length - 2];
    const state = Object.values(State).find((state) =>
      config.paths[state.toLocaleLowerCase()].includes(stateFolder)
    );
    const filename = filepathParts.pop().split(".")[0];

    const document = new Document({
      id: filename,
      originalName: filename,
      path: filepath,
      state,
    });
    await addDocumentToMetadata(document);
    return document;
  }

  static async forNewFile(file) {
    const id = uuid();
    const document = new Document({
      id: id,
      originalName: file.name,
      path: null,
      state: State.SCANNER,
    });
    document.path = document.#getPathForState(State.SCANNER);

    await writeFile(document.path, file.buffer);

    await addDocumentToMetadata(document);
    return document;
  }

  #getPathForState(state) {
    switch (state) {
      case State.INBOX:
        return `${config.paths.inbox}/${this.id}.pdf`;
      case State.SCANNER:
        return `${config.paths.scanner}/${this.id}.pdf`;
      case State.PROCESSED:
        return `${config.paths.processed}/${this.id}.pdf`;
      case State.WAITING:
        return `${config.paths.waiting}/${this.id}.pdf`;
      case State.TRASH:
        return `${config.paths.trash}/${this.id}.pdf`;
      default:
        throw new Error(`Invalid state: ${state}`);
    }
  }

  addEditor(editor) {
    this.editedBy.push(editor);
  }

  async classify() {
    const assessment = await classifyDocument(this);

    this.classificationResult = new ClassificationResult(assessment.result);
    this.classificationType = ClassificationType.AUTO;
    if (this.classificationResult.isConfidenceSufficient()) {
      await this.changeState(State.PROCESSED);
    } else {
      await this.changeState(State.INBOX);
    }
  }

  async changeState(newState) {
    if (!Object.values(State).includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }

    const targetPath = this.#getPathForState(newState);
    await rename(this.path, targetPath);
    this.path = targetPath;
    this.state = newState;

    await updateDocumentInMetadata(this);
  }

  async updateClassificationResultMetadata({
    kind = undefined,
    docId = undefined,
    docDateSic = undefined,
    docSubject = undefined,
  }) {
    this.classificationResult.updateMetadata({ kind, docId, docDateSic, docSubject });

    await updateDocumentInMetadata(this);
  }

  async toFileObject() {
    return new File([await readFile(this.path)], this.path, { type: "application/pdf" });
  }
}
