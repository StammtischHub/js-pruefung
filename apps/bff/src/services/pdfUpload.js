import multer from "multer";
import { config } from "../config.js";
import path from "node:path";
import { InvalidFileTypeError } from "../errors/UploadErrors.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.fileSizeUploadLimit },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf";

    if (!isPdf) {
      return cb(new InvalidFileTypeError());
    }
    cb(null, true);
  },
});

export const pdfUpload = upload.single("file");
