import { State } from "./types/State.js";
import { config } from "../config.js";
import { readFile, rename, writeFile } from "node:fs/promises";
import { addDocumentToMetadata, updateDocumentInMetadata } from "../services/MetadataService.js";
import { ClassificationType } from "./types/ClassificationType.js";
import { v4 as uuid } from "uuid";
import { Classification } from "./Classification.js";
import { classifyDocument } from "../services/ClassificationService.js";
import { AppError } from "../errors/AppError.js";

export class Document {
  constructor(data) {
    this.id = data.id;
    this.originalName = data.originalName;
    this.path = data.path;
    this.state = data.state;
    this.creationDate = new Date().toISOString();
    this.classification = data.classification ? new Classification(data.classification) : null;
    this.editedBy = data.editedBy ?? [];
    this.deletionFlagSetDate = data.deletionFlagSetDate ?? null;
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
      originalName: file.originalname,
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
        throw new AppError(`Invalid state: ${state}`, 400);
    }
  }

  addEditor(editor) {
    this.editedBy.push(editor);
  }

  async classify() {
    const assessment = await classifyDocument(this);

    this.classification = new Classification({
      ...assessment.result,
      type: ClassificationType.AUTO,
    });
    if (this.classification.isConfidenceSufficient()) {
      await this.changeState(State.PROCESSED);
    } else {
      await this.changeState(State.INBOX);
    }
  }

  async changeState(newState) {
    if (!Object.values(State).includes(newState)) {
      throw new AppError(`Invalid state: ${newState}`, 400);
    }

    if (newState === this.state) return;
    if (this.state === State.TRASH) {
      this.deletionFlagSetDate = null;
    }

    const targetPath = this.#getPathForState(newState);
    await rename(this.path, targetPath);
    this.path = targetPath;
    this.state = newState;

    await updateDocumentInMetadata(this);
  }

  async updateClassificationMetadata(data) {
    this.classification.updateMetadata(data);

    await updateDocumentInMetadata(this);
  }

  async toFileObject() {
    return new File([await readFile(this.path)], this.path, { type: "application/pdf" });
  }

  async prepForDeletion() {
    if (this.deletionFlagSetDate != null) return;
    this.deletionFlagSetDate = new Date().toISOString();
    await this.changeState(State.TRASH);
  }
}
