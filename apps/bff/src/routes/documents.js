import express from "express";
import { pdfUpload } from "../services/pdfUpload.js";
import { Document } from "../domain/Document.js";
import { getDocumentById, getDocumentsByState } from "../services/MetadataService.js";
import { State } from "../domain/types/State.js";
import { next as getNextDocument } from "../services/sortingService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../errors/AppError.js";
import { FileTooLargeError, InvalidFileTypeError } from "../errors/UploadErrors.js";

const router = express.Router();

const uploadErrorMap = {
  LIMIT_FILE_SIZE: FileTooLargeError,
  INVALID_FILE_TYPE: InvalidFileTypeError,
};

router.post("/", (req, res, next) => {
  pdfUpload(req, res, async (err) => {
    if (err) {
      const ErrorClass = uploadErrorMap[err.code];
      return next(ErrorClass ? new ErrorClass() : new AppError("Upload failed.", 400));
    }
    if (!req.file) {
      return next(new AppError("No file received.", 400));
    }

    const document = await Document.forNewFile(req.file);
    return res.status(201).json(document);
  });
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { state } = req.query;
    if (!state) throw new AppError("No 'state' query provided.", 400);

    const metadata = await getDocumentsByState(state.toUpperCase());
    return res.status(200).json(metadata.map((document) => document.path));
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const document = await getDocumentById(req.params.id);
    await document.updateClassificationResultMetadata(req.body);
    return res.status(200).json(document);
  })
);

router.post(
  "/:id/wait",
  asyncHandler(async (req, res) => {
    const document = await getDocumentById(req.params.id);
    await document.changeState(State.WAITING);
    return res.status(200).json(document);
  })
);

router.post(
  "/:id/continue",
  asyncHandler(async (req, res) => {
    const document = await getDocumentById(req.params.id);
    await document.changeState(State.INBOX);
    return res.status(200).json(document);
  })
);

router.post(
  "/:id/finish",
  asyncHandler(async (req, res) => {
    const document = await getDocumentById(req.params.id);
    await document.changeState(State.PROCESSED);
    return res.status(200).json(document);
  })
);

router.post(
  "/:id/prep-for-deletion",
  asyncHandler(async (req, res) => {
    const document = await getDocumentById(req.params.id);
    await document.prepForDeletion();
    return res.status(200).json(document);
  })
);

router.put(
  "/:id/classify",
  asyncHandler(async (req, res) => {
    const document = await getDocumentById(req.params.id);
    await document.classify();
    return res.status(200).json(document);
  })
);

router.get(
  "/next",
  asyncHandler(async (req, res) => {
    const document = await getNextDocument();
    return res.status(200).json(document);
  })
);

export default router;
