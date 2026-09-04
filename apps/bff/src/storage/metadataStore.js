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

export async function saveMetadata(document) {
  const all = await readAll();
  all.push(document);
  await fs.writeFile(config.metadataFile, JSON.stringify(all, null, 2));
  return document;
}

export async function getAllMetadata() {
  return readAll();
}
