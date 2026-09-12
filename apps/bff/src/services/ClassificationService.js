import { config } from "../config.js";
import { getDocumentById } from "./MetadataService.js";

export async function classifyDocument(document) {
  const file = await document.toFileObject();

  if (!(file instanceof File) && !(file instanceof Blob)) {
    throw new Error("A PDF file must be passed");
  }

  const url = config.classificationServiceUrl + document.id;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: file,
    });

    if (!response.ok) {
      console.error(`API-Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending PDF file", error);
    throw error;
  }
}

export async function updateClassificationResultMetadataOfDocument(documentId, metadata) {
  const document = await getDocumentById(documentId);
  await document.updateClassificationResultMetadata(metadata);
  return document;
}
