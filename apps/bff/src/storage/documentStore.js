import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

export async function moveDocumentToState(file, id, state) {
  let statePath;
  switch (state) {
    case config.states.inbox:
      statePath = config.paths.inbox;
      break;
    case config.states.scanner:
      statePath = config.paths.scanner;
      break;
    case config.states.processed:
      statePath = config.paths.processed;
      break;
    case config.states.waiting:
      statePath = config.paths.waiting;
      break;
    case config.states.trash:
      statePath = config.paths.trash;
      break;
    default:
      throw new Error(`Invalid state: ${state}`);
  }
  const targetPath = path.join(statePath, `${id}.pdf`);
  return await fs.rename(file.path, targetPath);
}
