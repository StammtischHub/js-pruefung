import fs from "node:fs/promises";
import { config } from "../config.js";
import { NotFoundError } from "../objects/errors/NotFoundError.js";
import { Document } from "../objects/Document.js";

let queue = Promise.resolve();
function enqueue(task) {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}

export async function readAll() {
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

export async function removeDocuments(idsToRemove) {
  const allMetadata = await readAll();
  const remaining = allMetadata.filter((item) => !idsToRemove.includes(item.id));
  await fs.writeFile(config.metadataFile, JSON.stringify(remaining, null, 2));
}

export async function addDocumentToMetadata(document) {
  return enqueue(async () => {
    const allMetadata = await readAll();
    const documentIndex = allMetadata.findIndex((doc) => doc.id === document.id);

    if (documentIndex === -1) {
      allMetadata.push(document);
      await fs.writeFile(config.metadataFile, JSON.stringify(allMetadata, null, 2));
    }
  });
}

export async function updateDocumentInMetadata(document) {
  return enqueue(async () => {
    const allMetadata = await readAll();
    const documentIndex = allMetadata.findIndex((doc) => doc.id === document.id);

    if (documentIndex === -1) {
      throw new Error(`Document with ID ${document.id} not found`);
    }
    allMetadata[documentIndex] = document;

    await fs.writeFile(config.metadataFile, JSON.stringify(allMetadata, null, 2));
    return document;
  });
}

export async function getDocumentsByState(state) {
  return enqueue(() =>
    readAll().then((metadata) => {
      return metadata
        .filter((document) => document.state === state)
        .map((document) => new Document(document));
    })
  );
}

export async function getDocumentById(id) {
  return enqueue(() =>
    readAll().then((metadata) => {
      const document = metadata.find((doc) => doc.id === id);
      if (!document) {
        throw new NotFoundError(`Document with ID ${id} not found`);
      }
      return new Document(document);
    })
  );
}
