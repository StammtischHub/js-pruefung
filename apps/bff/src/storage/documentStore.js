import { rename, writeFile, readFile } from "node:fs/promises";
import { config } from "../config.js";
import { addDocumentToMetadata } from "./metadataStore.js";

function getNewPathForState(filename, state) {
  switch (state) {
    case config.states.inbox:
      return `${config.paths.inbox}/${filename}`;
    case config.states.scanner:
      return `${config.paths.scanner}/${filename}`;
    case config.states.processed:
      return `${config.paths.processed}/${filename}`;
    case config.states.waiting:
      return `${config.paths.waiting}/${filename}`;
    case config.states.trash:
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
  const targetPath = getNewPathForState(`${filename}.pdf`, config.states.scanner);
  const buffer = await readFile(file.path);
  await writeFile(targetPath, buffer);
  return targetPath;
}
