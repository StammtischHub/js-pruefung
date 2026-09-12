import { getDocumentById } from "./MetadataService.js";
import { NotFoundError } from "../errors/NotFoundError.js";

/**
 *
 * Executes an operation on multiple documents.
 *
 * Runs over all IDs independently
 * so that a failed document does not block the others.
 * Each entry in the result describes a success or failure
 * for exactly one document.
 *
 * @param {string[]} documentIds
 * @param {(document: import("../Document.js").Document) => Promise<void>} operation
 * @param {string} errorMessage Error message for http status 500
 * @returns {Promise<Array<{id: string, status: number, document?: any, error?: string}>>}
 */
async function processDocuments(documentIds, operation, errorMessage) {
  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    throw new Error("documentIds must be a non-empty array");
  }

  const results = await Promise.allSettled(
    documentIds.map((id) => processSingleDocument(id, operation))
  );

  return results.map((result, index) => {
    const id = documentIds[index];

    if (result.status === "fulfilled") {
      return {
        id,
        status: 200,
        document: result.value,
      };
    }

    const err = result.reason;

    if (err instanceof NotFoundError) {
      console.log(err);
      return {
        id,
        status: 404,
        error: err.message,
      };
    }

    console.error(err);
    return {
      id,
      status: 500,
      error: errorMessage,
    };
  });
}

async function processSingleDocument(id, operation) {
  const document = await getDocumentById(id);
  await operation(document);
  return document;
}

/**
 * Changes the state of multiple documents.
 */
export function changeStateOfDocuments(documentIds, state) {
  return processDocuments(
    documentIds,
    (document) => document.changeState(state),
    `Set document state to '${state}' failed.`
  );
}

/**
 * Prepares multiple documents for deletion.
 */
export function prepDocumentsForDeletion(documentIds) {
  return processDocuments(
    documentIds,
    (document) => document.prepForDeletion(),
    "Marking the document for deletion failed."
  );
}

/**
 * Classifies multiple documents.
 */
export function classifyDocuments(documentIds) {
  return processDocuments(
    documentIds,
    (document) => document.classify(),
    "Classifying document failed."
  );
}
