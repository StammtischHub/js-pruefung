import { State } from "./State.js";
import { config } from "../config.js";
import { readFile, rename, writeFile } from "node:fs/promises";
import { addDocumentToMetadata, updateDocumentInMetadata } from "../storage/metadataStore.js";
import { ClassificationType } from "./ClassificationType.js";
import { v4 as uuid } from "uuid";

export class Document {
  constructor(id, originalName, path, state) {
    this.id = id;
    this.originalName = originalName;
    this.path = path;
    this.state = state;
    this.classificationType = null;
    this.editedBy = [];
    this.deleteFlagSetDate = null;
  }

  static async forScannerFile(filepath) {
    const filepathParts = filepath.split("/");
    const stateFolder = filepathParts[filepathParts.length - 2];
    const state = Object.values(State).find((state) =>
      config.paths[state.toLocaleLowerCase()].includes(stateFolder)
    );
    const filename = filepathParts.pop().split(".")[0];

    const document = new Document(filename, filename, filepath, state);
    await addDocumentToMetadata(document);
    return document;
  }

  static async forNewFile(file) {
    const id = uuid();
    const document = new Document(id, file.name, null, State.SCANNER);
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

  #isConfidenceSufficient(assessment) {
    for (const value of Object.values(assessment.result)) {
      if (!value.score) continue;

      if (value.score < config.confidenceThreshold) return false;
    }
    return false;
  }

  addEditor(editor) {
    this.editedBy.push(editor);
  }

  async classify(assessment) {
    this.classificationType = ClassificationType.AUTO;
    if (this.#isConfidenceSufficient(assessment)) {
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

  async toFileObject() {
    return new File([await readFile(this.path)], this.path, { type: "application/pdf" });
  }
}
