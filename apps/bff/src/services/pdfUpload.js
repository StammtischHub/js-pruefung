import multer from "multer";
import { config } from "../config.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.fileSizeUploadLimit },
});

export const pdfUpload = upload.single("file");
