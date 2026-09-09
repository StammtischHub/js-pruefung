import { rename, writeFile, readFile } from "node:fs/promises";
import { config } from "../config.js";
import { State } from "../objects/State.js";

function getNewPathForState(filename, state) {
  switch (state) {
    case State.INBOX:
      return `${config.paths.inbox}/${filename}`;
    case State.SCANNER:
      return `${config.paths.scanner}/${filename}`;
    case State.PROCESSED:
      return `${config.paths.processed}/${filename}`;
    case State.WAITING:
      return `${config.paths.waiting}/${filename}`;
    case State.TRASH:
      return `${config.paths.trash}/${filename}`;
    default:
      throw new Error(`Invalid state: ${state}`);
  }
}

export async function changeDocumentState(filepath, state) {
  const filename = filepath.split("/").pop();
  const targetPath = getNewPathForState(filename, state);
  await rename(filepath, targetPath);
  return targetPath;
}

export async function addNewDocument(filename, file) {
  const targetPath = getNewPathForState(`${filename}.pdf`, State.SCANNER);
  const buffer = await readFile(file.path);
  await writeFile(targetPath, buffer);
  return targetPath;
}
