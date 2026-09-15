import { asyncHandler } from "../utils/asyncHandler.js";
import { getDocumentById } from "../services/MetadataService.js";
import express from "express";

const router = express.Router();

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "No 'id' path parameter provided." });

    const document = await getDocumentById(id);
    return res
      .status(200)
      .sendFile(document.path, { headers: { "Content-Type": "application/pdf" } });
  })
);

export default router;
