import express from "express";
import { pdfUpload } from "../services/pdfUpload.js";
import { Document } from "../domain/Document.js";
import { getDocumentsByState } from "../services/MetadataService.js";
import { State } from "../domain/types/State.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { next } from "../services/sortingService.js";
import {
  changeStateOfDocuments,
  prepDocumentsForDeletion,
  classifyDocuments,
} from "../services/BulkActionService.js";
import { updateClassificationResultMetadataOfDocument } from "../services/ClassificationService.js";

const router = express.Router();

router.post("/", (req, res) => {
  pdfUpload(req, res, async (err) => {
    if (err) {
      const errors = {
        LIMIT_FILE_SIZE: { status: 413, msg: "File to big to handle." },
        INVALID_FILE_TYPE: { status: 415, msg: "Only PDF-Files allowed." },
      };

      const known = errors[err.code];
      return known
        ? res.status(known.status).json({ error: known.msg })
        : res.status(400).json({ error: "Upload failed." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file received." });
    }

    try {
      const document = await Document.forNewFile(req.file);
      return res.status(201).json(document);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Processing failed." });
    }
  });
});

router.get("/", async (req, res) => {
  const state = req.query.state;
  if (!state) return res.status(400).json({ error: "No 'state' query provided." });

  try {
    const documents = await getDocumentsByState(state.toUpperCase());
    return res.status(200).json(documents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Fetching documents failed." });
  }
});

router.get("/next", async (req, res) => {
  try {
    const document = await next();
    return res.status(200).json(document);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Fetching the next document failed." });
  }
});

router.put("/wait", async (req, res) => {
  const documentIds = req.body.documentIds;
  if (!documentIds) return res.status(400).json({ error: "No 'documentIds' query provided." });

  try {
    const results = await changeStateOfDocuments(documentIds, State.WAITING);
    return res.status(207).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Set document state to waiting failed." });
  }
});

router.put("/continue", async (req, res) => {
  const documentIds = req.body.documentIds;
  if (!documentIds) return res.status(400).json({ error: "No 'documentIds' query provided." });

  try {
    const results = await changeStateOfDocuments(documentIds, State.INBOX);
    return res.status(207).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Set document state to inbox failed." });
  }
});

router.put("/finish", async (req, res) => {
  const documentIds = req.body.documentIds;
  if (!documentIds) return res.status(400).json({ error: "No 'documentIds' query provided." });

  try {
    const results = await changeStateOfDocuments(documentIds, State.PROCESSED);
    return res.status(207).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Set document state to processed failed." });
  }
});

router.put("/prep-for-deletion", async (req, res) => {
  const documentIds = req.body.documentIds;
  if (!documentIds) return res.status(400).json({ error: "No 'documentIds' query provided." });

  try {
    const results = await prepDocumentsForDeletion(documentIds);
    return res.status(207).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Marking the document to delete failed." });
  }
});

router.post("/classify", async (req, res) => {
  const documentIds = req.body.documentIds;
  if (!documentIds) return res.status(400).json({ error: "No 'documentIds' query provided." });

  try {
    const results = await classifyDocuments(documentIds);
    return res.status(207).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Updating document failed." });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "No 'id' query provided." });

  try {
    const document = await updateClassificationResultMetadataOfDocument(id, req.body);
    return res.status(200).json(document);
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.log(err);
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Updating document failed." });
  }
});

export default router;
