import { readAll, removeDocuments } from "./MetadataService.js"
import { config } from "../config.js";
import fs from 'fs/promises';

export async function deleteOldFiles() {
  const metadata = await readAll();

  const deletionFlagTimestamp = new Date(document.deletionFlagSetDate).getTime();
  const deletionThresholdReached = Date.now() > deletionFlagTimestamp + config.deletionRetentionSeconds * 1000;

  const documentsToDelete = metadata.filter((document) =>
    document.deletionFlagSetDate != null && deletionThresholdReached
  );

  for (const document of documentsToDelete) {
    try {
      await fs.unlink(document.path);
      console.log(`Deleted: ${document.path}`);
    } catch (err) {
      console.error(`Error deleting ${document.path}:`, err);
    }
  }

  const idsToRemove = documentsToDelete.map((document) => document.id);
  await removeDocuments(idsToRemove);
}
