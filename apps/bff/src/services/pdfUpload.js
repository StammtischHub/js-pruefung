import multer from "multer";
import path from "node:path";
import { config } from "../config.js";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.paths.scanner),
  }),
  limits: { fileSize: config.fileSizeUploadLimit },

  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf";

    if (!isPdf) {
      const err = new Error("Invalid file type");
      err.code = "INVALID_FILE_TYPE";
      return cb(err);
    }
    cb(null, true);
  },
});

export const pdfUpload = upload.single("file");
