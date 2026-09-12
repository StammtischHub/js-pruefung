import express from "express";
import { Document } from "../domain/Document.js";
import { getDocumentsByState } from "../services/MetadataService.js";
import { State } from "../domain/types/State.js";
import { getNextDocument } from "../services/SortingService.js";
import {
  changeStateOfDocuments,
  prepDocumentsForDeletion,
  classifyDocuments,
} from "../services/BulkActionService.js";
import { updateClassificationResultMetadataOfDocument } from "../services/ClassificationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../errors/AppError.js";
import { pdfUpload } from "../services/UploadService.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    await pdfUpload(req, res);

    if (!req.file) {
      throw new AppError("No file received.", 400);
    }

    const document = await Document.forNewFile(req.file);
    return res.status(201).json(document);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const stateQuery = req.query.state;
    if (!stateQuery) throw new AppError("No 'state' query provided.", 400);

    const state = stateQuery.toUpperCase();
    if (!State[state]) throw new AppError("Invalid 'state' query provided.", 400);

    const documents = await getDocumentsByState(state);
    return res.status(200).json(documents);
  })
);

router.get(
  "/next",
  asyncHandler(async (req, res) => {
    const document = await getNextDocument();
    return res.status(200).json(document);
  })
);

router.put(
  "/wait",
  asyncHandler(async (req, res) => {
    const documentIds = req.body.documentIds;
    if (!documentIds) throw new AppError("No 'documentIds' key provided in body.", 400);

    const results = await changeStateOfDocuments(documentIds, State.WAITING);
    return res.status(207).json(results);
  })
);

router.put(
  "/continue",
  asyncHandler(async (req, res) => {
    const documentIds = req.body.documentIds;
    if (!documentIds) throw new AppError("No 'documentIds' key provided in body.", 400);

    const results = await changeStateOfDocuments(documentIds, State.INBOX);
    return res.status(207).json(results);
  })
);

router.put(
  "/finish",
  asyncHandler(async (req, res) => {
    const documentIds = req.body.documentIds;
    if (!documentIds) throw new AppError("No 'documentIds' key provided in body.", 400);

    const results = await changeStateOfDocuments(documentIds, State.PROCESSED);
    return res.status(207).json(results);
  })
);

router.put(
  "/prep-for-deletion",
  asyncHandler(async (req, res) => {
    const documentIds = req.body.documentIds;
    if (!documentIds) throw new AppError("No 'documentIds' key provided in body.", 400);

    const results = await prepDocumentsForDeletion(documentIds);
    return res.status(207).json(results);
  })
);

router.post(
  "/classify",
  asyncHandler(async (req, res) => {
    const documentIds = req.body.documentIds;
    if (!documentIds) throw new AppError("No 'documentIds' key provided in body.", 400);

    const results = await classifyDocuments(documentIds);
    return res.status(207).json(results);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "No 'id' path parameter provided." });

    const document = await updateClassificationResultMetadataOfDocument(id, req.body);
    return res.status(200).json(document);
  })
);

export default router;
