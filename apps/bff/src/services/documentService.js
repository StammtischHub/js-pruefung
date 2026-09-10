import { v4 as uuid } from "uuid";
import { addDocumentToMetadata } from "../storage/metadataStore.js";
import { Document } from "../objects/Document.js";

export async function handleManualUpload(file) {
  const id = uuid();

  const document = new Document(id, file.name);

  await addDocumentToMetadata(document);
  return document;
}
