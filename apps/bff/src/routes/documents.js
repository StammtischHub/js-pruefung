import express from "express";
import { pdfUpload } from "../services/pdfUpload.js";
import { handleManualUpload } from "../services/documentService.js";

const router = express.Router();

router.post("/upload", (req, res) => {
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
      const document = await handleManualUpload(req.file);
      return res.status(201).json(document);
    } catch {
      return res.status(500).json({ error: "Processing failed." });
    }
  });
});

export default router;
