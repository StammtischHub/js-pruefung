import { getDocumentById } from "./MetadataService.js";
import { NotFoundError } from "../errors/NotFoundError.js";

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

    const error = result.reason;

    if (error instanceof NotFoundError) {
      console.log(error);
      return {
        id,
        status: 404,
        error: error.message,
      };
    }

    console.error(error);
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

export function changeStateOfDocuments(documentIds, state) {
  return processDocuments(
    documentIds,
    (document) => document.changeState(state),
    `Set document state to '${state}' failed.`
  );
}

export function prepDocumentsForDeletion(documentIds) {
  return processDocuments(
    documentIds,
    (document) => document.prepForDeletion(),
    "Marking the document for deletion failed."
  );
}

export function classifyDocuments(documentIds) {
  return processDocuments(
    documentIds,
    (document) => document.classify(),
    "Classifying document failed."
  );
}

export function addEditorToDocument(documentsIds, username) {
  return processDocuments(
    documentsIds,
    (document) => document.addEditor(username),
    "Adding editor to document failed"
  );
}
