import express from "express";
import { pdfUpload } from "../services/pdfUpload.js";
import { Document } from "../objects/Document.js";
import { getDocumentsByState } from "../services/MetadataService.js";

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

export default router;
