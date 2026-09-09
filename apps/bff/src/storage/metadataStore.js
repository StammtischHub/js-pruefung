import fs from "node:fs/promises";
import { config } from "../config.js";

async function readAll() {
  try {
    const raw = await fs.readFile(config.metadataFile, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function addDocumentToMetadata(document) {
  const allMetadata = await readAll();
  allMetadata.push(document);
  await fs.writeFile(config.metadataFile, JSON.stringify(allMetadata, null, 2));
  return document;
}

export async function updateDocumentInMetadata(document) {
  const allMetadataWithoutDocument = await readAll().filter((doc) => doc.id !== document.id);
  allMetadataWithoutDocument.push(document);
  await fs.writeFile(config.metadataFile, JSON.stringify(allMetadataWithoutDocument, null, 2));
  return document;
}

export async function getAllMetadata() {
  return readAll();
}
