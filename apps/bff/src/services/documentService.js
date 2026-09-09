import { v4 as uuid } from "uuid";
import { addNewDocument } from "../storage/documentStore.js";
import { addDocumentToMetadata } from "../storage/metadataStore.js";
import { config } from "../config.js";
import { Document } from "../objects/Document.js";
import { ClassificationType } from "../objects/ClassificationType.js";
import { State } from "../objects/State.js";

export async function handleManualUpload(file) {
  const id = uuid();
  const storedPath = await addNewDocument(id, file);

  const doc = new Document(id, file.name, storedPath, ClassificationType.MANUAL, State.SCANNER);

  await addDocumentToMetadata(doc);
  return doc;
}
