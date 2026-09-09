import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { addDocumentToMetadata } from "./metadataStore.js";

function getPathByState(state, statePath) {
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
  return statePath;
}

export async function moveDocumentToState(
  file,
  id,
  state
) {
  let statePath;
  statePath = getPathByState(state, statePath);
  const targetPath = path.join(statePath, `${id}.pdf`);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(targetPath, buffer);
  return targetPath;
}
