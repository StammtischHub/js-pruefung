import { v4 as uuid } from "uuid";
import { moveDocumentToState } from "../storage/documentStore.js";
import { saveMetadata } from "../storage/metadataStore.js";
import { config } from "../config.js";

export async function handleManualUpload(file) {
  const id = uuid();
  const storedPath = await moveDocumentToState(file, id, config.states.scanner, config.classificationType.manual);

  const document = {
    id,
    originalName: file.originalname,
    path: storedPath,
    source: config.classificationType.manual,
    state: config.states.scanner,
    uploadedAt: new Date().toISOString(),
  };

  await saveMetadata(document);
  return document;
}
