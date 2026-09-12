import multer from "multer";
import { config } from "../config.js";
import path from "node:path";
import { AppError } from "../errors/AppError.js";
import { InvalidFileTypeError, FileTooLargeError } from "../errors/UploadErrors.js";

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

const pdfUploadMiddleware = upload.single("file");

export function pdfUpload(req, res) {
  return new Promise((resolve, reject) => {
    pdfUploadMiddleware(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") return reject(new FileTooLargeError());
        if (err instanceof AppError) return reject(err);
        return reject(new AppError("Upload failed.", 400));
      }
      resolve();
    });
  });
}
