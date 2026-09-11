import fs from "node:fs/promises";
import { config } from "../config.js";

let queue = Promise.resolve();
function enqueue(task) {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}

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

export async function getAllMetadata(state = undefined) {
  return enqueue(() => readAll().then((metadata) => {
    return state ? metadata.filter((document) => document.state === state) : metadata;
  }));
}
