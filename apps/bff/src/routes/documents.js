import express from "express";
import { pdfUpload } from "../services/pdfUpload.js";
import { Document } from "../domain/Document.js";
import { getDocumentById, getDocumentsByState } from "../services/MetadataService.js";
import { State } from "../domain/types/State.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { next } from "../services/sortingService.js"

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
  try {
    const state = req.query.state;

    if (!state) return res.status(400).json({ error: "No 'state' query provided." });

    const metadata = await getDocumentsByState(state.toUpperCase());
    return res.status(200).json(metadata.map((document) => document.path));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Fetching documents failed." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const document = await getDocumentById(id);

    await document.updateClassificationResultMetadata(req.body);
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

router.post("/:id/wait", async (req, res) => {
  try {
    const id = req.params.id;
    const document = await getDocumentById(id);

    await document.changeState(State.WAITING);
    return res.status(200).json(document);
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.log(err);
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Set document back to inbox failed." });
  }
});

router.post("/:id/continue", async (req, res) => {
  try {
    const id = req.params.id;
    const document = await getDocumentById(id);

    await document.changeState(State.INBOX);
    return res.status(200).json(document);
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.log(err);
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Set document back to inbox failed." });
  }
});

router.post("/:id/finish", async (req, res) => {
  try {
    const id = req.params.id;
    const document = await getDocumentById(id);

    await document.changeState(State.PROCESSED);
    return res.status(200).json(document);
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.log(err);
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Set document to processed failed." });
  }
});

router.post("/:id/prep-for-deletion", async (req, res) => {
  try {
    const id = req.params.id;
    const document = await getDocumentById(id);

    await document.prepForDeletion();
    return res.status(200).json(document);
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.log(err);
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Marking the document to delete failed." });
  }
});

router.put("/:id/classify", async (req, res) => {
  try {
    const { id } = req.params;
    const document = await getDocumentById(id);

    await document.classify();
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

router.get("/next", async (req, res) => {
  try {
    const document = await next();
    return res.status(200).json(document);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Marking the document to delete failed." });
  }
});

export default router;
