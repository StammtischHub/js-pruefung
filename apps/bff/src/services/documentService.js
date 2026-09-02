import { v4 as uuid } from "uuid";
import { moveToInbox } from "../storage/fileStore.js";
import {getAllMetadata, saveMetadata} from "../storage/metadataStore.js";
import { config } from "../config.js";

export async function handleManualUpload(file) {
  const id = uuid();
  const storedPath = await moveToInbox(file, id);

  const document = {
    id,
    originalName: file.originalname,
    path: storedPath,
    source: config.source.manual,
    state: config.states.inbox,
    uploadedAt: new Date().toISOString(),
  };

  await saveMetadata(document);
  return document;
}

export async function editMetadata(id, updatedFields) {
  const metadataFile = await getAllMetadata();
  const index = metadataFile.findIndex((entry) => entry.id === id);

  if (index === -1) { return null; }

  const metadata = metadataFile[index];

  const updatedMetadata = {
    ...metadata,
    ...updatedFields,
    id: metadata.id,
    source: config.source.manual,
  }

  metadataFile[index] = updatedMetadata;
  await saveMetadata(metadataFile);

  return updatedMetadata;
}
