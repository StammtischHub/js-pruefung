import { v4 as uuid } from "uuid";
import { moveToScanner } from "../storage/fileStore.js";
import { saveMetadata } from "../storage/metadataStore.js";
import { config } from "../config.js";

export async function handleManualUpload(file) {
  const id = uuid();
  const storedPath = await moveToScanner(file, id);

  const document = {
    id,
    originalName: file.originalname,
    path: storedPath,
    source: config.source.manual,
    state: config.states.scanner,
    uploadedAt: new Date().toISOString(),
  };

  await saveMetadata(document);
  return document;
}
