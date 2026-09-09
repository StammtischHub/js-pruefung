import { v4 as uuid } from "uuid";
import { addNewDocument } from "../storage/documentStore.js";
import { addDocumentToMetadata } from "../storage/metadataStore.js";
import { config } from "../config.js";

export async function handleManualUpload(file) {
  const id = uuid();
  const storedPath = await addNewDocument(id, file);

  const document = {
    id,
    originalName: file.originalname,
    path: storedPath,
    source: config.classificationType.manual,
    state: config.states.scanner,
    uploadedAt: new Date().toISOString(),
  };

  await addDocumentToMetadata(document);
  return document;
}
