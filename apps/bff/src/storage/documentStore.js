import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { saveMetadata } from "./metadataStore.js";

export async function moveDocumentToState(
  file,
  id,
  state,
  classificationType = config.classificationType.auto
) {
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

  const document = {
    id,
    originalName: null,
    path: targetPath,
    classificationType: classificationType,
    state: state,
    uploadedAt: new Date().toISOString(),
  };

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(targetPath, buffer);

  await saveMetadata(document);

  return targetPath;
}
