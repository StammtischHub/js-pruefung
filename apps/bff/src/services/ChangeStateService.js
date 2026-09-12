import { getDocumentById } from "./MetadataService.js";
import { NotFoundError } from "../errors/NotFoundError.js"; // Pfad ggf. anpassen

/**
 * Ändert den State mehrerer Dokumente.
 *
 * Läuft über alle IDs unabhängig voneinander,
 * damit ein fehlgeschlagenes Dokument die anderen nicht blockiert.
 * Jeder Eintrag im Ergebnis-Array beschreibt Erfolg oder Fehler
 * für genau ein Dokument.
 *
 * @param {string[]} documentIds
 * @param {string} state
 * @returns {Promise<Array<{id: string, status: number, document?: any, error?: string}>>}
 */
export async function changeStateOfDocuments(documentIds, state) {
  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    throw new Error("documentIds must be a non-empty array");
  }

  const results = await Promise.allSettled(
    documentIds.map((id) => changeStateOfSingleDocument(id, state))
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
      error: "Set document state failed.",
    };
  });
}

async function changeStateOfSingleDocument(id, state) {
  const document = await getDocumentById(id);
  await document.changeState(state);
  return document;
}
