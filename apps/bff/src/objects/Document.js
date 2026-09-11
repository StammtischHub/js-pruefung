import { State } from "./State.js";
import { config } from "../config.js";
import { readFile, rename, writeFile } from "node:fs/promises";
import { v4 as uuid } from "uuid";
import { addDocumentToMetadata, updateDocumentInMetadata } from "../storage/metadataStore.js";

export class Document {
  constructor(id, originalName, path, state) {
    this.id = id;
    this.originalName = originalName;
    this.path = path;
    this.state = state;
    this.classificationType = null;
    this.confidence = null;
    this.editedBy = [];
    this.deleteFlagSetDate = null;

    addDocumentToMetadata(this).then(() => this);
  }

  static fromExistingFile(filepath) {
    const filepathParts = filepath.split("/");
    const stateFolder = filepathParts[filepathParts.length - 2];
    const state = Object.values(State).find((state) =>
      config.paths[state.toLocaleLowerCase()].includes(stateFolder)
    );
    const filename = filepathParts.pop().split(".")[0];

    return new Document(filename, filename, filepath, state);
  }

  static forNewFile(file) {
    const id = uuid();
    const path = this.#getNewPathForState(State.SCANNER);
    writeFile(path, file.buffer).then(() => {});

    return new Document(id, file.name, path, State.SCANNER);
  }

  #getNewPathForState(state) {
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

  async changeState(newState) {
    if (!Object.values(State).includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }

    const targetPath = this.#getNewPathForState(newState);
    await rename(this.path, targetPath);
    this.path = targetPath;
    this.state = newState;

    await updateDocumentInMetadata(this);
  }

  async toFileObject() {
    return new File([await readFile(this.path)], this.path, { type: "application/pdf" });
  }
}
