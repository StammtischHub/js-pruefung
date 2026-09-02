import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = path.resolve(__dirname, "../../../");

export const config = {
  port: process.env.PORT || 4000,

  classificationServiceUrl: process.env.CLASSIFICATION_SERVICE_URL || "http://localhost:5000",

  paths: {
    scanner: path.join(projectRoot, "data", "scanner"),
    inbox: path.join(projectRoot, "data", "inbox"),
    needsReview: path.join(projectRoot, "data", "needs_review"),
    waiting: path.join(projectRoot, "data", "waiting"),
    processing: path.join(projectRoot, "data", "processing"),
    trash: path.join(projectRoot, "data", "trash"),
  },

  metadataFile: path.join(projectRoot, "data", "metadata.json"),

  deletionRetentionDays: 30,

  fileSizeUploadLimit: 20 * 1024 * 1024, // 20MB

  states: {
    inbox: "INBOX",
    needsReview: "NEEDS_REVIEW",
    processing: "PROCESSING",
    waiting: "WAITING",
    trash: "TRASH",
  },

  source: {
    auto: "AUTO",
    manual: "MANUAL",
  },
};
