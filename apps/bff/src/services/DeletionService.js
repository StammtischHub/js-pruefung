import { removeDocuments } from "./MetadataService.js";
import { config } from "../config.js";
import fs from "fs/promises";
import { State } from "../domain/types/State.js";
import { getDocumentsByState } from "./MetadataService.js";

export async function deleteOldFiles() {
  const trashMetadata = await getDocumentsByState(State.TRASH);

  const documentsToDelete = trashMetadata.filter((document) => {
    if (document.deletionFlagSetDate == null)
      throw new Error("Deletion flag not set for document in trash: " + document.id);

    const deletionFlagTimestamp = new Date(document.deletionFlagSetDate).getTime();
    const deletionThresholdReached =
      Date.now() > deletionFlagTimestamp + config.deletionRetentionSeconds * 1000;
    return deletionThresholdReached;
  });

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
