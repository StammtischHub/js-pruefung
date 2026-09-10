import { State } from "./State.js";
import { config } from "../config.js";
import { readFile, rename, writeFile } from "node:fs/promises";
import { v4 as uuid } from "uuid";

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
    const path = this.#getNewPathForState(id, State.SCANNER);
    writeFile(path, file.buffer).then(() => {});

    return new Document(id, file.name, path, State.SCANNER);
  }

  #getNewPathForState(filename, state) {
    switch (state) {
      case State.INBOX:
        return `${config.paths.inbox}/${filename}.pdf`;
      case State.SCANNER:
        return `${config.paths.scanner}/${filename}.pdf`;
      case State.PROCESSED:
        return `${config.paths.processed}/${filename}.pdf`;
      case State.WAITING:
        return `${config.paths.waiting}/${filename}.pdf`;
      case State.TRASH:
        return `${config.paths.trash}/${filename}.pdf`;
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

    const targetPath = this.#getNewPathForState(this.originalName, newState);
    await rename(this.path, targetPath);
    this.path = targetPath;
    this.state = newState;
  }

  toFileObject() {
    return new File([readFile(this.path)], this.originalName, { type: "application/pdf" });
  }
}
